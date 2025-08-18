import { keys } from "lodash-es";
import * as Yup from "yup";

export const GlobalFilterSchema = Yup.object().shape({
  filter: Yup.lazy((value) =>
    Yup.object()
      .nullable()
      .shape(
        keys(value).reduce((map, key) => ({ ...map, [key]: Yup.mixed() }), {})
      )
      .transform((e) => (!e ? {} : e))
  ),
  page: Yup.number().min(1, "Minimum Page Number should be 1.").notRequired(),
  limit: Yup.number().min(1, "Minimum Limit should be 1.").notRequired(),
  sort: Yup.lazy((value) =>
    Yup.object()
      .nullable()
      .shape(
        keys(value).reduce((map, key) => ({ ...map, [key]: Yup.number() }), {})
      )
      .transform((e) => (!e ? {} : e))
  ),
  attributes: Yup.array().of(Yup.string()).notRequired(),
});
