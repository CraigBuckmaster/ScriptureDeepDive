/**
 * plugins/withFmtConsteval.js — Expo config plugin.
 *
 * Injects a post_install hook into the generated iOS Podfile that sets
 * `FMT_USE_CONSTEVAL=0` on the `fmt` Pod target, working around a
 * Clang/Xcode 26.x incompatibility with fmt 8.x's consteval-annotated
 * FMT_STRING macros.
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
 * fmt 8.x's header `fmt/format-inl.h` uses `consteval` on FMT_STRING(...)
 * template instantiations. Under Xcode 26's stricter Apple Clang, those
 * instantiations fail with "call to consteval function ... is not a
 * constant expression" errors:
 *
 *     fmt/format-inl.h:59:24: call to consteval function is not a
 *       constant expression
 *
 * The fix: set `FMT_USE_CONSTEVAL=0` as a preprocessor definition for the
 * fmt Pod. fmt's own compatibility macro downgrades all consteval
 * functions to constexpr, which both older and newer Clang versions
 * handle without complaint. Compile-time format-string validation is
 * disabled — meaning invalid format strings would surface at runtime
 * instead of build time — but RN uses fmt only in logging internals with
 * fixed format strings; no user-controlled input reaches it.
 *
 * ── Lifecycle ──────────────────────────────────────────────────────
 *
 * This plugin is a temporary workaround paired with the iOS 26 void-method
 * patch and `buildReactNativeFromSource: true`. Remove ALL THREE together
 * when a released RN 0.81.x or SDK 54.x includes the upstream fix, at
 * which point RN can be consumed as a precompiled XCFramework again.
 *
 * Idempotent: a marker check ensures repeated prebuilds don't stack
 * duplicate patches in the Podfile.
 */

const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const MARKER = '# BEGIN withFmtConsteval';
const END_MARKER = '# END withFmtConsteval';

const PATCH_BLOCK = `
  ${MARKER} — applied by plugins/withFmtConsteval.js
  # Works around Xcode 26 Clang strictness with fmt 8.x consteval usage.
  # Removed when we no longer build React Native from source.
  installer.pods_project.targets.each do |target|
    if target.name == 'fmt'
      target.build_configurations.each do |config|
        config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
        unless config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'].include?('FMT_USE_CONSTEVAL=0')
          config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FMT_USE_CONSTEVAL=0'
        end
      end
    end
  end
  ${END_MARKER}
`;

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

      // Idempotency — skip if already patched.
      if (contents.includes(MARKER)) {
        return config;
      }

      // The Expo template's post_install block opens with this exact line.
      // Matching on the line with the installer binding is specific enough
      // to avoid accidentally matching a different post_install block.
      const postInstallOpen = /(post_install do \|installer\|\n)/;
      if (!postInstallOpen.test(contents)) {
        throw new Error(
          '[withFmtConsteval] Could not find `post_install do |installer|` ' +
            'block in Podfile. The Expo template structure may have changed; ' +
            'update this plugin to match.',
        );
      }

      contents = contents.replace(postInstallOpen, `$1${PATCH_BLOCK}`);
      fs.writeFileSync(podfilePath, contents);

      return config;
    },
  ]);
};

module.exports = withFmtConsteval;
