import { promises as fs } from 'fs';
import path from 'path';
import axios from 'axios';

export class LogoHelper {
  private static readonly LOGO_URL: string | null = null;

  private static readonly LOCAL_FALLBACKS = [
    path.resolve(process.cwd(), 'src/assets/LogoCamara.png'),
    path.resolve(process.cwd(), 'dist/assets/LogoCamara.png'),
  ];

  private static cachedLogo: Buffer | null = null;
  private static loadingPromise: Promise<Buffer | null> | null = null;

  private static async fetchRemoteLogo(): Promise<Buffer | null> {
    if (!this.LOGO_URL) return null;

    try {
      const response = await axios.get<ArrayBuffer>(this.LOGO_URL, {
        responseType: 'arraybuffer',
        timeout: 10000,
        validateStatus: (status) => status >= 200 && status < 300,
      });

      const buffer = Buffer.from(response.data);
      return buffer.length ? buffer : null;
    } catch (error) {
      console.error('LogoHelper: error descargando logo remoto:', error);
      return null;
    }
  }

  private static async fetchLocalLogo(): Promise<Buffer | null> {
    for (const filePath of this.LOCAL_FALLBACKS) {
      try {
        const file = await fs.readFile(filePath);
        if (file.length) return file;
      } catch {
        // seguir
      }
    }
    return null;
  }

  static async getLogo(forceRefresh = false): Promise<Buffer | null> {
    if (!forceRefresh && this.cachedLogo?.length) return this.cachedLogo;
    if (!forceRefresh && this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = (async () => {
      const remoteLogo = await this.fetchRemoteLogo();
      if (remoteLogo) {
        this.cachedLogo = remoteLogo;
        return remoteLogo;
      }

      const localLogo = await this.fetchLocalLogo();
      if (localLogo) {
        this.cachedLogo = localLogo;
        return localLogo;
      }

      this.cachedLogo = null;
      return null;
    })();

    try {
      return await this.loadingPromise;
    } finally {
      this.loadingPromise = null;
    }
  }
}