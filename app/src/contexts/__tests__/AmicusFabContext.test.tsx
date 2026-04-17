import React from 'react';
import { Text, Pressable } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import {
  AmicusFabProvider,
  useAmicusFab,
  useSuppressAmicusFab,
} from '@/contexts/AmicusFabContext';

function Status() {
  const { isVisible } = useAmicusFab();
  return <Text>{isVisible ? 'visible' : 'hidden'}</Text>;
}

function Suppressor({ on }: { on: boolean }) {
  useSuppressAmicusFab(on);
  return null;
}

function Toggle({ fn, label }: { fn: () => void; label: string }) {
  return (
    <Pressable accessibilityLabel={label} onPress={fn}>
      <Text>{label}</Text>
    </Pressable>
  );
}

function HideShowControls() {
  const { hide, show } = useAmicusFab();
  return (
    <>
      <Toggle fn={hide} label="hide" />
      <Toggle fn={show} label="show" />
    </>
  );
}

describe('AmicusFabProvider', () => {
  it('starts visible', () => {
    const { getByText } = render(
      <AmicusFabProvider>
        <Status />
      </AmicusFabProvider>,
    );
    expect(getByText('visible')).toBeTruthy();
  });

  it('hide and show toggle the state', () => {
    const { getByText, getByLabelText } = render(
      <AmicusFabProvider>
        <Status />
        <HideShowControls />
      </AmicusFabProvider>,
    );
    fireEvent.press(getByLabelText('hide'));
    expect(getByText('hidden')).toBeTruthy();
    fireEvent.press(getByLabelText('show'));
    expect(getByText('visible')).toBeTruthy();
  });

  it('ref-counts so two suppressors compose', () => {
    const { getByText, getByLabelText } = render(
      <AmicusFabProvider>
        <Status />
        <HideShowControls />
      </AmicusFabProvider>,
    );
    fireEvent.press(getByLabelText('hide'));
    fireEvent.press(getByLabelText('hide'));
    expect(getByText('hidden')).toBeTruthy();
    fireEvent.press(getByLabelText('show'));
    // Still one suppressor outstanding — should remain hidden.
    expect(getByText('hidden')).toBeTruthy();
    fireEvent.press(getByLabelText('show'));
    expect(getByText('visible')).toBeTruthy();
  });

  it('useSuppressAmicusFab hides during mount and restores on unmount', () => {
    function Harness({ suppress }: { suppress: boolean }) {
      return (
        <>
          <Status />
          {suppress && <Suppressor on />}
        </>
      );
    }
    const { getByText, rerender } = render(
      <AmicusFabProvider>
        <Harness suppress={false} />
      </AmicusFabProvider>,
    );
    expect(getByText('visible')).toBeTruthy();
    rerender(
      <AmicusFabProvider>
        <Harness suppress={true} />
      </AmicusFabProvider>,
    );
    expect(getByText('hidden')).toBeTruthy();
    rerender(
      <AmicusFabProvider>
        <Harness suppress={false} />
      </AmicusFabProvider>,
    );
    expect(getByText('visible')).toBeTruthy();
  });
});
