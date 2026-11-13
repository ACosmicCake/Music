import { describe, it, expect, vi } from 'vitest';
import './env.js';
import E from '../src/engine.js';
import { show3D, scenesMode, isPhone } from '../src/ui/scenes3d.js';

describe('3D scenes setting', () => {
  it('reads the setting, Automatic when unset or unknown', () => {
    delete E.state.settings.scenes3d;
    expect(scenesMode()).toBe('auto');
    E.state.settings.scenes3d = 'weird';
    expect(scenesMode()).toBe('auto');
    E.state.settings.scenes3d = 'off';
    expect(scenesMode()).toBe('off');
  });
  it('never draws 3D when off, and not on a phone in Automatic', () => {
    E.state.settings.scenes3d = 'off';
    expect(show3D()).toBe(false);
    vi.stubGlobal('window', { matchMedia: q => ({ matches: q.includes('coarse') }) });
    E.state.settings.scenes3d = 'auto';
    expect(isPhone()).toBe(true);
    expect(show3D()).toBe(false);
    vi.unstubAllGlobals();
  });
  it('is kept per device', async () => {
    const { DEVICE_SETTINGS } = await import('../src/sync.js');
    expect(DEVICE_SETTINGS).toContain('scenes3d');
  });
});
