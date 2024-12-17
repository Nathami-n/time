import * as React from "react";

import { ArrowUpDown, ChevronDown, EditIcon, Trash2Icon } from "lucide-react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Student as PrismaStudent } from "@prisma/client";

import { Input } from "../ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "../ui/table";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { DeleteStudentModal, EditStudentModal } from "~/hooks/modals";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "../ui/dropdown-menu";


interface Student {
    id: string,
    name: string,
    email: string,
    reg_no: string,
}

export function StudentTable({ data }: {
    data: Student[],
}) {
    const [open, setOpen] = React.useState(false);
    const [deleteOpen, setDeleteOpen] = React.useState(false);

    const [selectedStudent, setSelectedStudent] = React.useState("");
    const columns: ColumnDef<Student>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                } />
            ),
            cell: ({ row }) => (
                <Checkbox checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: () => <div className="text-start">Name</div>

        },
        {
            accessorKey: "email",
            header: ({ column }) => {
                return (
                    <Button variant={"ghost"}
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Email
                        <ArrowUpDown />
                    </Button>
                )
            }
        },
        {
            accessorKey: "reg_no",
            header: () => <div className="text-start">Reg_no</div>

        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                return (

                    <div className="flex items-center gap-x-1">

                        <EditIcon size={16} onClick={() => {
                            setSelectedStudent(row.original.id)
                            setOpen(true)
                        }} className="stroke-green-500 cursor-pointer" />
                        <Trash2Icon size={16} className="stroke-rose-500 cursor-pointer" onClick={() => {
                            setSelectedStudent(row.original.id)
                            setDeleteOpen(true)
                        }} />
                    </div>
                )
            }
        }
    ]
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    );
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({})
    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection
        }
    })
    const studentData = React.useMemo(() => data.find((student) => student.id == selectedStudent), [data, selectedStudent]);
    return (
        <div className="w-full">
            <EditStudentModal
                open={open}
                studentData={studentData as PrismaStudent}
                setOpen={setOpen}
            />
            <DeleteStudentModal
                open={deleteOpen}
                setOpen={setDeleteOpen}
                id={selectedStudent}
                name={studentData?.name as string}
            />
            <div className="flex items-center py-4 max-md:gap-x-3">
                <Input
                    placeholder="Filter with emails"
                    value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("email")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border p-2">
                <Table>
                    <TableHeader>
                        {
                            table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder ? null : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))
                        }
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}


