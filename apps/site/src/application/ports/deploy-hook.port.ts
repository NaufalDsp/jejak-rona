/**
 * Port Deploy Hook
 * Mendefinisikan aksi pemicu build statis di Cloudflare Pages dengan pembatasan laju / penggabungan.
 */
export interface DeployHookPort {
  triggerBuild(reason: string): Promise<{
    queued: boolean;
    queuedAt: string;
    message: string;
  }>;
}
