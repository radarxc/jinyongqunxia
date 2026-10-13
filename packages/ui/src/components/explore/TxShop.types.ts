export interface ShopRow {
  readonly itemId: string;
  readonly name: string;
  readonly icon: string | null;
  readonly grade: number;
  readonly unitPriceWen: number;
  readonly stock: number | null;
  readonly owned: number;
  readonly disabledReason: string | null;
}

export interface ShopPanelView {
  readonly title: string;
  readonly facilityKind: string;
  readonly moneyWen: number;
  readonly rows: {
    readonly buy: readonly ShopRow[];
    readonly sell: readonly ShopRow[];
  };
  readonly busy: boolean;
}

export interface ShopIntent {
  readonly itemId: string;
  readonly count: number;
  readonly unitPriceWen: number;
}
