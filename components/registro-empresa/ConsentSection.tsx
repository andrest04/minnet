import { AlertTriangle } from "lucide-react";
import { CustomCheckbox as Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConsentSectionProps {
  consent: boolean;
  error?: string;
  onConsentChange: (consent: boolean) => void;
}

export default function ConsentSection({
  consent,
  error,
  onConsentChange,
}: ConsentSectionProps) {
  return (
    <div className="pt-4 border-t border-border">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Consentimiento <span className="text-destructive">*</span>
      </h3>
      <Checkbox
        label={
          <span className="text-sm">
            Declaro que la información proporcionada es verídica y me comprometo
            a usar esta plataforma de forma responsable y ética, respetando los
            derechos de las comunidades.
          </span>
        }
        checked={consent}
        onChange={onConsentChange}
        error={error}
      />

      <Alert className="border-amber-200 bg-amber-50 mt-4">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-sm text-amber-800">
          Tu cuenta será revisada por un administrador antes de ser aprobada.
          Recibirás acceso completo una vez verificada tu identidad.
        </AlertDescription>
      </Alert>
    </div>
  );
}
