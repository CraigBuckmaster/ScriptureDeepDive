type UsageListener = () => void;

const listeners = new Set<UsageListener>();

export function subscribeAmicusUsageChanges(listener: UsageListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitAmicusUsageChanged(): void {
  for (const listener of listeners) {
    listener();
  }
}
