type Opaque<T, K> = T & { __opaque__: K };

// type Int = Opaque<number, 'Int'>;
// type ID = Opaque<number, 'ID'>;

type integer = Opaque<number, "integer">;
type decimal = Opaque<number, "decimal">;