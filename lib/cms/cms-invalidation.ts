import type { QueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query-keys";

/** After article create/update from CMS modals or editors. */
export function invalidateAfterCmsArticleMutation(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: qk.articles() });
  void qc.invalidateQueries({ queryKey: qk.cmsDashboard() });
}

/** After career create/update from CMS modals. */
export function invalidateAfterCmsCareerMutation(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: qk.careers() });
  void qc.invalidateQueries({ queryKey: qk.cmsDashboard() });
}

/** After promo create/update from CMS modals. */
export function invalidateAfterCmsPromoMutation(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: qk.promos() });
  void qc.invalidateQueries({ queryKey: qk.cmsDashboard() });
}
