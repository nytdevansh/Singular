declare global {
  namespace Reflect {
    function defineMetadata(
      metadataKey: string | symbol,
      metadataValue: unknown,
      target: object,
      propertyKey?: string | symbol
    ): void;

    function getMetadata(
      metadataKey: string | symbol,
      target: object,
      propertyKey?: string | symbol
    ): any;
  }
}

export {};
