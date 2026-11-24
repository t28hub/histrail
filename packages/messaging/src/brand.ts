declare const brand: unique symbol;

/**
 * `T` tagged with `N`, so values of the same base type can't be swapped by mistake.
 *
 * @typeParam T - The underlying type.
 * @typeParam N - The name that tells this brand apart.
 */
export type Brand<T, N extends string> = T & { readonly [brand]: N };
