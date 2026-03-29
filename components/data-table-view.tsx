'use client';

import { useState, useEffect, ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PaginationControl } from '@/components/pagination-control';
import { Loader2, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PaginatedResponse, PaginationParams } from '@/lib/api';

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
  searchPlaceholder = 'Buscar...',
  actions,
}: DataTableViewProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState<PaginationParams>({
    page: 1,
    limit: 10,
    search: '',
    status: '',
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
      console.error('Error loading data:', error);
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
    const search = formData.get('search') as string;
    setParams((prev) => ({ ...prev, search, page: 1 }));
  };

  const clearFilters = () => {
    setParams({
      page: 1,
      limit: 10,
      search: '',
      status: '',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
          {description && <p className="text-muted-foreground text-xs sm:text-sm">{description}</p>}
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>

      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="relative min-w-[200px] flex-1 sm:max-w-sm">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            name="search"
            defaultValue={params.search}
            placeholder={searchPlaceholder}
            className="h-10 pl-9 text-sm"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {filters?.map((filter) => (
            <Select
              key={String(filter.key)}
              value={(params[filter.key] as string) || 'all'}
              onValueChange={(value) =>
                setParams((prev) => ({
                  ...prev,
                  [filter.key]: value === 'all' ? '' : value,
                  page: 1,
                }))
              }
            >
              <SelectTrigger className="h-10 w-full text-sm sm:w-[160px]">
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
              <X className="mr-2 h-4 w-4" /> Limpiar
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col, idx) => (
                  <TableHead key={idx} className={cn('text-xs whitespace-nowrap', col.className)}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center">
                    <Loader2 className="text-primary mx-auto h-8 w-8 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-muted-foreground h-32 text-center text-sm"
                  >
                    No se encontraron resultados
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, rowIdx) => (
                  <TableRow key={rowIdx}>
                    {columns.map((col, colIdx) => (
                      <TableCell
                        key={colIdx}
                        className={cn('text-xs whitespace-nowrap sm:text-sm', col.className)}
                      >
                        {typeof col.accessor === 'function'
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

      <div className="text-muted-foreground flex flex-col items-center justify-between gap-4 pt-2 text-xs sm:flex-row sm:text-sm">
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
