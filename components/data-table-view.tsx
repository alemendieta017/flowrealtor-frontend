"use client";

import { useState, useEffect, ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationControl } from "@/components/pagination-control";
import { Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PaginatedResponse, PaginationParams } from "@/lib/api";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
}

interface FilterOption {
  label: string;
  value: string;
}

interface DataTableViewProps<T> {
  title: string;
  description?: string;
  columns: Column<T>[];
  fetchData: (params: PaginationParams) => Promise<PaginatedResponse<T>>;
  filters?: {
    placeholder: string;
    options: FilterOption[];
    key: keyof PaginationParams;
  }[];
  searchPlaceholder?: string;
  actions?: ReactNode;
}

export function DataTableView<T>({
  title,
  description,
  columns,
  fetchData,
  filters,
  searchPlaceholder = "Buscar...",
  actions,
}: DataTableViewProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    search: "",
    status: "",
  });
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetchData(params);
      setData(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    setParams((prev) => ({ ...prev, search, page: 1 }));
  };

  const clearFilters = () => {
    setParams({
      page: 1,
      limit: 10,
      search: "",
      status: "",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <form
          onSubmit={handleSearch}
          className="relative flex-1 min-w-[200px] sm:max-w-sm"
        >
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            defaultValue={params.search}
            placeholder={searchPlaceholder}
            className="pl-9 h-10 text-sm"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {filters?.map((filter) => (
            <Select
              key={String(filter.key)}
              value={(params[filter.key] as string) || "all"}
              onValueChange={(value) =>
                setParams((prev) => ({
                  ...prev,
                  [filter.key]: value === "all" ? "" : value,
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="w-full sm:w-[160px] h-10 text-sm">
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {filter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {(params.search || params.status || params.type) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10 text-xs">
              <X className="h-4 w-4 mr-2" /> Limpiar
            </Button>
          )}
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col, idx) => (
                  <TableHead key={idx} className={cn("text-xs whitespace-nowrap", col.className)}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center"
                  >
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-muted-foreground text-sm"
                  >
                    No se encontraron resultados
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, rowIdx) => (
                  <TableRow key={rowIdx}>
                    {columns.map((col, colIdx) => (
                      <TableCell key={colIdx} className={cn("text-xs sm:text-sm whitespace-nowrap", col.className)}>
                        {typeof col.accessor === "function"
                          ? col.accessor(item)
                          : (item[col.accessor] as ReactNode)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-muted-foreground pt-2">
        <div>
          Mostrando {data.length} de {meta.total} resultados
        </div>
        <PaginationControl
          currentPage={meta.page}
          totalPages={meta.totalPages}
          onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
        />
      </div>
    </div>
  );
}
