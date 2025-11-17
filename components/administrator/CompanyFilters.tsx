import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FilterType = "all" | "pending" | "approved" | "rejected";

interface CompanyFiltersProps {
  filter: FilterType;
  searchQuery: string;
  resultCount: number;
  onFilterChange: (filter: FilterType) => void;
  onSearchChange: (query: string) => void;
}

export default function CompanyFilters({
  filter,
  searchQuery,
  resultCount,
  onFilterChange,
  onSearchChange,
}: CompanyFiltersProps) {
  const filters: { value: FilterType; label: string }[] = [
    { value: "all", label: "Todas" },
    { value: "pending", label: "Pendientes" },
    { value: "approved", label: "Aprobadas" },
    { value: "rejected", label: "Rechazadas" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Gestión de Empresas</h3>
        <div className="flex gap-2">
          {filters.map((f) => (
            <Button
              key={f.value}
              onClick={() => onFilterChange(f.value)}
              variant={filter === f.value ? "default" : "outline"}
              size="sm"
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por nombre, empresa, email o cargo..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {searchQuery && (
        <p className="text-sm text-muted-foreground">
          {resultCount} resultado{resultCount !== 1 ? "s" : ""} encontrado
          {resultCount !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
