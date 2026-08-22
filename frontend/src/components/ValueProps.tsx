import React from "react";
import { ChevronDivider } from "./ChevronDivider";
import { Layers, Landmark, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../context/LanguageContext";

export const ValueProps: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <section className="bg-salt py-16 border-b border-stone/30 relative">
      {/* Signature Stepped Chevron Divider Above */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <ChevronDivider count={12} className="opacity-90" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center sm:text-left"
        >
          <span className="font-mono text-xs text-gold uppercase tracking-widest block mb-1">
            {t("valueProps.headerBadge", "System Architecture & Purpose")}
          </span>
          <h2 className="font-display text-2xl sm:text-3xl text-charcoal tracking-tight">
            {t("valueProps.title", "Why this exists")}
          </h2>
        </motion.div>

        {/* Integrated Asymmetric Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-ink text-salt border border-stone/40 p-6 sm:p-10 relative overflow-hidden"
        >
          {/* Subtle Watermark Motif */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-stepwell-pattern opacity-10 pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 relative z-10 divide-y md:divide-y-0 md:divide-x divide-stone/30">
            {/* Value Prop 1 */}
            <div className="pt-6 md:pt-0 md:pr-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-gold text-lg font-bold px-2 py-0.5 bg-salt/10 border border-gold/40">
                  01
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-stone">
                  {language === "gu"
                    ? "પદ્ધતિ"
                    : language === "hi"
                      ? "कार्यप्रणाली"
                      : "Methodology"}
                </span>
              </div>
              <h3 className="font-display text-xl text-salt font-medium flex items-center gap-2">
                <Layers className="w-4 h-4 text-gold" />
                {t("valueProps.prop1Title", "Geometric Route Precision")}
              </h3>
              <p className="text-sm font-body text-salt/80 leading-relaxed">
                {t(
                  "valueProps.prop1Desc",
                  "Calculates intra-city distances, visitation times, and daily circular legs starting and ending at your accommodation base.",
                )}
              </p>
            </div>

            {/* Value Prop 2 */}
            <div className="pt-6 md:pt-0 md:px-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-gold text-lg font-bold px-2 py-0.5 bg-salt/10 border border-gold/40">
                  02
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-stone">
                  {language === "gu"
                    ? "નાણાકીય પારદર્શિતા"
                    : language === "hi"
                      ? "वित्तीय पारदर्शिता"
                      : "Financial Transparency"}
                </span>
              </div>
              <h3 className="font-display text-xl text-salt font-medium flex items-center gap-2">
                <Landmark className="w-4 h-4 text-gold" />
                {t("valueProps.prop2Title", "Authentic Heritage Stays")}
              </h3>
              <p className="text-sm font-body text-salt/80 leading-relaxed">
                {t(
                  "valueProps.prop2Desc",
                  "Verified Toran government hotels, restored 1920s merchant havelis, and eco-homestays ranked by location and hospitality.",
                )}
              </p>
            </div>

            {/* Value Prop 3 */}
            <div className="pt-6 md:pt-0 md:pl-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-gold text-lg font-bold px-2 py-0.5 bg-salt/10 border border-gold/40">
                  03
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-stone">
                  {language === "gu"
                    ? "સાંસ્કૃતિક વારસો"
                    : language === "hi"
                      ? "सांस्कृतिक विरासत"
                      : "Cultural Heritage"}
                </span>
              </div>
              <h3 className="font-display text-xl text-salt font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" />
                {t("valueProps.prop3Title", "Verified Expenses")}
              </h3>
              <p className="text-sm font-body text-salt/80 leading-relaxed">
                {t(
                  "valueProps.prop3Desc",
                  "Exact ASI monument entry fees, local thali dining rates, and transit fuel estimates logged in an exportable budget ledger.",
                )}
              </p>
            </div>
          </div>

          {/* Bottom Bar inside the asymmetric block */}
          <div className="mt-8 pt-6 border-t border-stone/30 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-stone">
            <span>
              {language === "gu"
                ? "ગુજરાત ટુરિઝમ બોર્ડ અને ASI ડેટાબેઝ સાથે ચકાસાયેલ"
                : language === "hi"
                  ? "गुजरात पर्यटन बोर्ड और एएसआई डेटाबेस के साथ सत्यापित"
                  : "Verified against Gujarat Tourism Board & Archaeological Survey of India datasets"}
            </span>
            <span className="text-gold font-medium">
              {language === "gu"
                ? "૨૦૨૬ પ્રવાસ સીઝન માટે અદ્યતન"
                : language === "hi"
                  ? "2026 यात्रा सत्र के लिए अद्यतन"
                  : "Updated for 2026 Travel Seasons"}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
