import { FieldError } from "../gql/graphql"

export const toErrorMap = (errors: FieldError[]) => {
    return errors.map(({ field, message }) => {
        return { name: field, message };
    });
}