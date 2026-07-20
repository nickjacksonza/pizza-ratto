declare module "vara" {
  type VaraTextOptions = {
    text: string;
    id?: string | number;
    fontSize?: number;
    strokeWidth?: number;
    color?: string;
    duration?: number;
    textAlign?: "left" | "center" | "right";
    x?: number;
    y?: number;
    autoAnimation?: boolean;
    queued?: boolean;
    delay?: number;
    letterSpacing?: number | Record<string, number>;
  };

  type VaraOptions = Omit<VaraTextOptions, "text" | "id">;

  export default class Vara {
    constructor(
      container: string,
      fontSource: string,
      text: VaraTextOptions[],
      options?: VaraOptions,
    );

    ready(callback: () => void): void;
    draw(id: string | number): void;
    playAll(): void;
  }
}
