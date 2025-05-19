interface VimeoPlayer {
  play(): Promise<void>
  pause(): Promise<void>
  unload(): Promise<void>
  setVolume(volume: number): Promise<number>
  getVolume(): Promise<number>
  setMuted(muted: boolean): Promise<boolean>
  getMuted(): Promise<boolean>
  setLoop(loop: boolean): Promise<boolean>
  getLoop(): Promise<boolean>
  setCurrentTime(seconds: number): Promise<number>
  getCurrentTime(): Promise<number>
  getDuration(): Promise<number>
  on(event: string, callback: Function): void
  off(event: string, callback: Function): void
}

interface VimeoPlayerConstructor {
  new (element: string | HTMLElement, options?: any): VimeoPlayer
}

declare global {
  interface Window {
    Vimeo: {
      Player: VimeoPlayerConstructor
    }
  }
}

export {}
