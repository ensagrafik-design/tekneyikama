"use client";

import { useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, Edit, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc/client";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  companyName: string | null;
  vessels: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  createdAt: Date;
};

const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "name",
    header: "Müşteri Adı",
    cell: ({ row }) => (
      <Link 
        href={`/admin/clients/${row.original.id}`}
        className="font-medium text-blue-600 hover:text-blue-800"
      >
        {row.getValue("name")}
      </Link>
    ),
  },
  {
    accessorKey: "companyName",
    header: "Şirket",
    cell: ({ row }) => row.getValue("companyName") || "-",
  },
  {
    accessorKey: "email",
    header: "E-posta",
    cell: ({ row }) => row.getValue("email") || "-",
  },
  {
    accessorKey: "phone",
    header: "Telefon",
    cell: ({ row }) => row.getValue("phone") || "-",
  },
  {
    accessorKey: "vessels",
    header: "Tekneler",
    cell: ({ row }) => {
      const vessels = row.getValue("vessels") as Client["vessels"];
      return (
        <Badge variant="secondary">
          {vessels.length} tekne
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Kayıt Tarihi",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      return new Intl.DateTimeFormat('tr-TR').format(date);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const client = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/clients/${client.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Düzenle
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash className="mr-2 h-4 w-4" />
              Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function ClientsPage() {
  const { data: clientsData, isLoading } = trpc.clients.list.useQuery({
    limit: 50,
  });

  if (isLoading) {
    return <div className="flex-1 p-8 pt-6">Yükleniyor...</div>;
  }

  const clients = clientsData?.items || [];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Müşteriler</h2>
        <Button asChild>
          <Link href="/admin/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Müşteri
          </Link>
        </Button>
      </div>

      <DataTable 
        columns={columns} 
        data={clients}
        searchKey="name"
        searchPlaceholder="Müşteri ara..."
      />
    </div>
  );
}