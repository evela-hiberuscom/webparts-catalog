declare module '@paquete/spfx-common/utils' {
  export interface ISafeLink {
    href: string;
    rel: string;
    target: string;
  }

  export function createSafeExternalLink(url: string): ISafeLink | undefined;
}
