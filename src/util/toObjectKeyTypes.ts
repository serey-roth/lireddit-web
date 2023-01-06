export type toObjectKeyTypes<T extends Record<string, any>> = {
    [Property in keyof T]: Property
}