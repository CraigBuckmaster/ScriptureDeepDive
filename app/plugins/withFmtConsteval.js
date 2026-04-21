/**
 * plugins/withFmtConsteval.js — Expo config plugin.
 *
 * Injects a post_install hook into the generated iOS Podfile that
 * downgrades the `fmt` Pod target (and only that target) to C++17,
 * working around a Clang/Xcode 26.x incompatibility with fmt's
 * consteval-annotated FMT_STRING macros.
 *
 * ── Why this plugin exists ─────────────────────────────────────────
 *
 * `app.json` sets `expo-build-properties.ios.buildReactNativeFromSource: true`
 * so that `patches/react-native+0.81.5.patch` (iOS 26 void-method crash
 * fix from facebook/react-native#56265) actually gets applied at build
 * time. With the precompiled React-Core XCFramework the patch would
 * have no effect.
 *
 * Building RN from source compiles its transitive C++ dependencies from
 * source too — including `fmt` via the `glog` and `React-cxxreact` Pods.
 * fmt's header `fmt/format-inl.h` uses `consteval` on FMT_STRING(...)
 * template instantiations. Under Xcode 26's stricter Apple Clang (21.x),
 * those instantiations fail with "call to consteval function ... is not
 * a constant expression" errors at five sites in format-inl.h (lines
 * 59, 60, 1387, 1391, 1394).
 *
 * See:
 *   - facebook/react-native#55601
 *   - fmtlib/fmt#4740
 *   - expo/expo#44229
 *
 * ── Why we downgrade to C++17, NOT define FMT_USE_CONSTEVAL=0 ──────
 *
 * The obvious first fix — set `FMT_USE_CONSTEVAL=0` via
 * `GCC_PREPROCESSOR_DEFINITIONS` — does NOT work for the fmt version
 * vendored into RN 0.81.5. fmt's `base.h` does not gate its
 * `FMT_USE_CONSTEVAL` setter with `#ifndef`; the detection block
 * unconditionally `#define`s it based on `__apple_build_version__`, so
 * an external `-D` flag gets clobbered by the internal define.
 * Empirically verified on rentamac (Xcode 26.4.1): the build fails
 * identically with the preprocessor define in place.
 *
 * Downgrading the language standard is the documented-working approach
 * (see bleepingswift.com article on the same error, and the top-voted
 * answer in fmtlib/fmt#4740). The mechanism: consteval is a C++20
 * feature. When fmt compiles as C++17, `__cpp_consteval` is not
 * defined, fmt's detection logic falls through, and `FMT_USE_CONSTEVAL`
 * ends up 0. The problematic consteval constructors never get
 * instantiated. fmt has long been C++11-compatible, so C++17 is safely
 * within its supported range. Compile-time format-string validation is
 * disabled — invalid format strings would surface at runtime instead
 * of build time — but RN uses fmt only in logging internals with fixed
 * format strings; no user-controlled input reaches fmt.
 *
 * Scope matters: we downgrade ONLY the `fmt` target, not project-wide.
 * React Native's own code (Fabric, Hermes, TurboModule JSI glue)
 * genuinely needs C++20 and will not compile as C++17.
 *
 * ── Injection point matters ───────────────────────────────────────
 *
 * The block MUST be injected AFTER the `react_native_post_install(...)`
 * call, NOT at the opening of `post_install do |installer|`. RN 0.81.5's
 * `react_native_post_install` ends by calling
 * `NewArchitectureHelper.set_clang_cxx_language_standard_if_needed`,
 * which iterates every pod target (including `fmt`) and sets
 * `CLANG_CXX_LANGUAGE_STANDARD = "c++20"`. A block injected before that
 * call would run first and then be silently overwritten, fmt would
 * still build as C++20, and the consteval error would reappear.
 *
 * ── Lifecycle ──────────────────────────────────────────────────────
 *
 * This plugin is a temporary workaround paired with the iOS 26
 * void-method patch and `buildReactNativeFromSource: true`. Remove ALL
 * THREE together when a released RN 0.81.x or SDK 54.x ships with a
 * newer fmt (12.1+) that handles Apple Clang 21's stricter consteval
 * rules, at which point RN can be consumed as a precompiled XCFramework
 * again and fmt is no longer compiled in the project build.
 *
 * Idempotent: repeated prebuilds strip-and-reinject the current block,
 * so stale content from prior plugin versions is replaced cleanly.
 */

const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const MARKER = '# BEGIN withFmtConsteval';
const END_MARKER = '# END withFmtConsteval';

const PATCH_BLOCK = `
  ${MARKER} — applied by plugins/withFmtConsteval.js
  # Downgrade ONLY the fmt Pod to C++17 so its consteval-annotated
  # FMT_STRING macros compile under Xcode 26.x Apple Clang 21+.
  # See the long comment at the top of plugins/withFmtConsteval.js.
  # Removed when we no longer build React Native from source.
  installer.pods_project.targets.each do |target|
    if target.name == 'fmt'
      target.build_configurations.each do |config|
        config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
      end
    end
  end
  ${END_MARKER}
`;

/**
 * Strip any existing plugin block so a rerun replaces with current content
 * rather than appending or silently keeping a stale block.
 * @param {string} contents
 * @returns {string}
 */
function stripExistingBlock(contents) {
  const startIdx = contents.indexOf(MARKER);
  if (startIdx === -1) return contents;
  const endIdx = contents.indexOf(END_MARKER, startIdx);
  if (endIdx === -1) return contents; // malformed; leave alone
  // Walk back to the start of the line containing MARKER.
  let lineStart = contents.lastIndexOf('\n', startIdx) + 1;
  // The injected PATCH_BLOCK starts with a leading newline, so after a
  // first run the block is preceded by a blank line. Consume that blank
  // line too, otherwise successive re-applies accumulate blank lines
  // and break idempotency.
  if (lineStart >= 2 && contents[lineStart - 2] === '\n') {
    lineStart -= 1;
  }
  const lineEnd = contents.indexOf('\n', endIdx);
  const afterBlock = lineEnd === -1 ? '' : contents.slice(lineEnd + 1);
  return contents.slice(0, lineStart) + afterBlock;
}

/**
 * Expo config plugin entry point.
 * @param {import('@expo/config-plugins').ConfigPlugin} config
 */
const withFmtConsteval = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile',
      );
      if (!fs.existsSync(podfilePath)) {
        throw new Error(
          `[withFmtConsteval] Podfile not found at ${podfilePath}. ` +
            'The Expo template may have moved or prebuild is running ' +
            'in an unexpected order.',
        );
      }

      let contents = fs.readFileSync(podfilePath, 'utf8');

      // Strip any stale block from a prior version of this plugin so we
      // always inject current content. Idempotent when no block is present.
      contents = stripExistingBlock(contents);

      // CRITICAL: inject AFTER the `react_native_post_install(...)` call,
      // not at the opening of `post_install do |installer|`. React Native
      // 0.81.5's `react_native_post_install` ends with a call to
      // `NewArchitectureHelper.set_clang_cxx_language_standard_if_needed`,
      // which iterates every pod target (including fmt) and sets
      // `CLANG_CXX_LANGUAGE_STANDARD` to c++20. If our block ran first,
      // RN would overwrite our c++17 setting and fmt would still build
      // as C++20, reproducing the consteval error we came here to fix.
      // See: facebook/react-native commit 71da21243 (scripts/cocoapods/
      // new_architecture.rb) for the overwrite logic.
      const callStart = contents.indexOf('react_native_post_install(');
      if (callStart === -1) {
        throw new Error(
          '[withFmtConsteval] Could not find `react_native_post_install(` ' +
            'call in Podfile. The Expo template structure may have changed; ' +
            'update this plugin to match.',
        );
      }

      // Scan forward tracking paren depth to find the matching closing `)`.
      // RN's post-install call uses simple args (no parens inside strings),
      // so naive counting is safe for the Expo Podfile template.
      let depth = 1;
      let i = callStart + 'react_native_post_install('.length;
      while (i < contents.length && depth > 0) {
        const ch = contents[i];
        if (ch === '(') depth += 1;
        else if (ch === ')') depth -= 1;
        i += 1;
      }
      if (depth !== 0) {
        throw new Error(
          '[withFmtConsteval] Could not find matching `)` for ' +
            'react_native_post_install call. Podfile may be malformed.',
        );
      }

      // `i` now points one past the closing `)`. Find the newline that
      // terminates the call statement and inject immediately after it so
      // the block starts on a fresh line.
      const nlIdx = contents.indexOf('\n', i);
      if (nlIdx === -1) {
        throw new Error(
          '[withFmtConsteval] No newline found after react_native_post_install() call.',
        );
      }

      contents =
        contents.slice(0, nlIdx + 1) + PATCH_BLOCK + contents.slice(nlIdx + 1);
      fs.writeFileSync(podfilePath, contents);

      return config;
    },
  ]);
};

module.exports = withFmtConsteval;
