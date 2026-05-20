'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T>({ columns, data, pagination }: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-gray-100 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-transparent border-b border-gray-100">
            <TableRow className="hover:bg-transparent border-none">
              {columns.map((col, i) => (
                <TableHead key={i} className="font-semibold text-gray-500 py-5 first:pl-6 last:pr-6">
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-gray-400">
                  Tidak ada data.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, i) => (
                <TableRow key={i} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-none">
                  {columns.map((col, j) => (
                    <TableCell key={j} className="py-4 text-gray-900 font-medium first:pl-6 last:pr-6">
                      {col.cell 
                        ? col.cell(item) 
                        : col.accessorKey ? String(item[col.accessorKey]) : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between sm:justify-end space-x-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-gray-200"
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Prev
          </Button>
          <div className="text-sm font-medium text-gray-500 px-4">
            {pagination.page} / {pagination.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-gray-200"
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
