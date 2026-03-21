import { RegisterForm } from '@/components/register-form';
import { APP_CONFIG } from '@/lib/api/config';
import { ThemeLogo } from '@/lib/theme-logo';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { ThemeToggle } from '@/components/layout/theme-toggle';

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
      <div className="flex w-full max-w-md flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium text-fd-foreground">
          <ThemeLogo />
          <span className="text-lg">{APP_CONFIG.name}</span>
        </a>
        <RegisterForm />
      </div>
    </div>
  );
}
