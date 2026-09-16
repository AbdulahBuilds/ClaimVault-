import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Receipt, BellRing, ArrowRight, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { THEME } from '../constants/theme';
import { ClaimVaultLogo } from '../components/ui/ClaimVaultLogo';

interface OnboardingScreenProps {
  onComplete: () => void;
  onGoToLogin: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete, onGoToLogin }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const slides = [
    {
      title: 'Never Miss a Warranty Again',
      description: 'Keep all your purchases, receipts, warranties and return deadlines in one place.',
      icon: ShieldCheck,
      color: 'bg-brand-navy',
      accent: 'text-brand-teal',
      visual: (
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-brand-teal/10 rounded-full animate-pulse" />
          <div className="w-36 h-36 rounded-3xl bg-white text-white flex items-center justify-center shadow-float border border-brand-teal/30 p-2">
            <ClaimVaultLogo size="xl" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white px-3 py-1.5 rounded-xl border border-brand-border shadow-card flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-green" />
            <span className="text-[11px] font-bold text-brand-navy">100% Protected</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Keep Your Receipts Safe',
      description: 'Store your receipts digitally so you can find them whenever you need them.',
      icon: Receipt,
      color: 'bg-brand-teal',
      accent: 'text-teal-200',
      visual: (
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-brand-navy/10 rounded-full animate-pulse" />
          <div className="w-36 h-36 rounded-3xl bg-brand-teal text-white flex items-center justify-center shadow-float border border-white/20">
            <Receipt className="w-16 h-16 text-white" />
          </div>
          <div className="absolute -bottom-2 -left-2 bg-white px-3 py-1.5 rounded-xl border border-brand-border shadow-card flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-brand-teal" />
            <span className="text-[11px] font-bold text-brand-navy">Digital Invoices</span>
          </div>
        </div>
      ),
    },
    {
      title: "Get Reminded Before It's Too Late",
      description: 'Receive reminders before return periods and warranties expire.',
      icon: BellRing,
      color: 'bg-amber-600',
      accent: 'text-amber-200',
      visual: (
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-500/10 rounded-full animate-pulse" />
          <div className="w-36 h-36 rounded-3xl bg-amber-500 text-white flex items-center justify-center shadow-float border border-amber-300/40">
            <BellRing className="w-16 h-16 text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white px-3 py-1.5 rounded-xl border border-brand-border shadow-card flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-orange animate-ping" />
            <span className="text-[11px] font-bold text-brand-navy">Smart Alerts</span>
          </div>
        </div>
      ),
    },
  ];

  const isLast = currentStep === slides.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="h-full flex flex-col justify-between p-6 bg-white select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <ClaimVaultLogo size="sm" withText />

        {!isLast && (
          <button
            onClick={handleSkip}
            className="text-xs font-bold text-brand-muted hover:text-brand-navy transition px-2 py-1"
          >
            Skip
          </button>
        )}
      </div>

      {/* Slide Visual & Content */}
      <div className="my-auto py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center text-center"
          >
            {/* Visual illustration */}
            <div className="mb-8">{slides[currentStep].visual}</div>

            {/* Title */}
            <h2 className="text-2xl font-extrabold text-brand-navy tracking-tight max-w-xs mb-3">
              {slides[currentStep].title}
            </h2>

            {/* Description */}
            <p className="text-sm font-medium text-brand-muted max-w-xs leading-relaxed">
              {slides[currentStep].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="space-y-6 pb-2">
        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentStep(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentStep === i ? 'w-8 bg-brand-teal' : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            variant={isLast ? 'action' : 'primary'}
            size="lg"
            fullWidth
            onClick={handleNext}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {isLast ? 'Get Started' : 'Next'}
          </Button>

          <div className="text-center">
            <button
              onClick={onGoToLogin}
              className="text-xs font-semibold text-brand-muted hover:text-brand-navy transition"
            >
              Already have an account? <span className="text-brand-teal font-bold">Log in</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
