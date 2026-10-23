import { Fragment } from "react";
import { Link } from "react-router";
import { FiChevronRight, FiHome } from "react-icons/fi";

/**
 * Reusable breadcrumb navigation for React Router applications.
 *
 * @param {Array<{label: string, to?: string, icon?: import('react').ReactNode, current?: boolean, ariaLabel?: string}>} items
 * @param {string} homeTo - Route used by the Home crumb.
 * @param {string} homeLabel - Accessible/display label for the Home crumb.
 * @param {boolean} showHome - Whether to include the Home crumb.
 * @param {import('react').ReactNode} actions - Optional content aligned to the right.
 * @param {string} className - Additional classes for the outer wrapper.
 * @param {string} navLabel - Accessible label for the navigation landmark.
 */
export default function BreadcrumbBar({
  items = [],
  homeTo = "/",
  homeLabel = "Home",
  showHome = true,
  actions = null,
  className = "",
  navLabel = "Breadcrumb",
}) {
  const safeItems = Array.isArray(items)
    ? items.filter((item) => item && typeof item.label === "string" && item.label.trim())
    : [];

  const crumbs = [
    ...(showHome
      ? [{ label: homeLabel, to: homeTo, icon: <FiHome size={15} aria-hidden="true" />, isHome: true }]
      : []),
    ...safeItems,
  ];

  if (crumbs.length === 0 && !actions) return null;

  return (
    <div
      className={`flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`.trim()}
    >
      <nav aria-label={navLabel} className="min-w-0">
        <ol className="flex min-w-0 flex-wrap items-center gap-y-2 text-sm">
          {crumbs.map((item, index) => {
            const isCurrent = item.current ?? index === crumbs.length - 1;
            const canNavigate = Boolean(item.to) && !isCurrent;
            const label = item.label;
            const icon = item.icon;

            return (
              <Fragment key={`${label}-${index}`}>
                {index > 0 && (
                  <li
                    aria-hidden="true"
                    className="mx-2 flex shrink-0 items-center text-slate-300"
                  >
                    <FiChevronRight size={15} />
                  </li>
                )}

                <li className="flex min-w-0 items-center">
                  {canNavigate ? (
                    <Link
                      to={item.to}
                      aria-label={item.ariaLabel}
                      className="inline-flex max-w-full items-center gap-2 rounded-md py-1 font-medium text-slate-500 transition-colors hover:text-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-100"
                    >
                      {icon && <span className="flex shrink-0 items-center">{icon}</span>}
                      <span className="max-w-[min(48vw,240px)] truncate">{label}</span>
                    </Link>
                  ) : (
                    <span
                      aria-current={isCurrent ? "page" : undefined}
                      aria-label={item.ariaLabel}
                      className={`inline-flex max-w-full items-center gap-2 rounded-md py-1 ${
                        isCurrent
                          ? "font-semibold text-slate-800"
                          : "font-medium text-slate-500"
                      }`}
                      title={label}
                    >
                      {icon && <span className="flex shrink-0 items-center">{icon}</span>}
                      <span className="max-w-[min(48vw,240px)] truncate">{label}</span>
                    </span>
                  )}
                </li>
              </Fragment>
            );
          })}
        </ol>
      </nav>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {actions}
        </div>
      )}
    </div>
  );
}
