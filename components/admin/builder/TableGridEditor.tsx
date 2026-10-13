"use client";

import { useState } from "react";
import { ClipboardPaste, Minus, Plus } from "lucide-react";
import { parseGrid } from "@/lib/question-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Table = { headers: string[]; rows: string[][] };

const MAX_COLS = 12;
const MAX_ROWS = 60;

/** Spreadsheet-like editor for a table block. Pasting tab/comma separated text fills the grid. */
export function TableGridEditor({
  headers,
  rows,
  onChange,
  idPrefix,
  nextBlank,
}: {
  headers: string[];
  rows: string[][];
  onChange: (t: Table) => void;
  idPrefix: string;
  nextBlank: number;
}) {
  const cols = Math.max(headers.length, 1);
  const [importOpen, setImportOpen] = useState(false);
  const [raw, setRaw] = useState("");
  const [firstIsHeader, setFirstIsHeader] = useState(true);
  const [hasHeader, setHasHeader] = useState(headers.some((h) => h.trim()) || rows.length === 0);

  const setHeader = (c: number, v: string) => onChange({ rows, headers: headers.map((h, i) => (i === c ? v : h)) });
  const setCell = (r: number, c: number, v: string) =>
    onChange({ headers, rows: rows.map((row, i) => (i === r ? row.map((x, k) => (k === c ? v : x)) : row)) });

  function addCol() {
    if (cols >= MAX_COLS) return;
    onChange({ headers: [...headers, ""], rows: rows.map((r) => [...r, ""]) });
  }
  function removeCol() {
    if (cols <= 1) return;
    onChange({ headers: headers.slice(0, -1), rows: rows.map((r) => r.slice(0, -1)) });
  }
  function addRow() {
    if (rows.length >= MAX_ROWS) return;
    onChange({ headers, rows: [...rows, Array(cols).fill("")] });
  }
  function removeRow() {
    if (rows.length <= 1) return;
    onChange({ headers, rows: rows.slice(0, -1) });
  }

  function applyGrid(grid: string[][], header: boolean) {
    if (!grid.length) return;
    const width = Math.min(MAX_COLS, grid[0]!.length);
    const clipped = grid.map((r) => r.slice(0, width));
    const head = header ? clipped[0]! : Array(width).fill("");
    const body = (header ? clipped.slice(1) : clipped).slice(0, MAX_ROWS);
    setHasHeader(header);
    onChange({ headers: head, rows: body.length ? body : [Array(width).fill("")] });
  }

  function onCellPaste(e: React.ClipboardEvent, r: number, c: number) {
    const text = e.clipboardData.getData("text");
    if (!/[\t\n]/.test(text.trim())) return; // single value: normal paste
    e.preventDefault();
    const grid = parseGrid(text);
    const width = Math.min(MAX_COLS, Math.max(cols, c + grid[0]!.length));
    const next = rows.map((row) => [...row, ...Array(Math.max(0, width - row.length)).fill("")]);
    const nextHeaders = [...headers, ...Array(Math.max(0, width - headers.length)).fill("")];
    grid.forEach((line, i) => {
      const rr = r + i;
      if (rr >= MAX_ROWS) return;
      while (next.length <= rr) next.push(Array(width).fill(""));
      line.forEach((val, j) => {
        if (c + j < width) next[rr]![c + j] = val;
      });
    });
    onChange({ headers: nextHeaders, rows: next });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Stepper label="Columns" value={cols} onMinus={removeCol} onPlus={addCol} minusOff={cols <= 1} plusOff={cols >= MAX_COLS} />
        <Stepper label="Rows" value={rows.length} onMinus={removeRow} onPlus={addRow} minusOff={rows.length <= 1} plusOff={rows.length >= MAX_ROWS} />
        <label className="ml-1 inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--brand)]"
            checked={hasHeader}
            onChange={(e) => {
              setHasHeader(e.target.checked);
              if (!e.target.checked) onChange({ rows, headers: Array(cols).fill("") });
            }}
          />
          Header row
        </label>
        <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={() => setImportOpen((o) => !o)} aria-expanded={importOpen}>
          <ClipboardPaste className="h-4 w-4" aria-hidden /> Paste from spreadsheet
        </Button>
      </div>

      {importOpen && (
        <div className="space-y-2 rounded-xl border border-border bg-ink-soft/50 p-3">
          <label htmlFor={`${idPrefix}-raw`} className="text-sm font-semibold">
            Paste cells from Excel, Sheets or a CSV file
          </label>
          <Textarea id={`${idPrefix}-raw`} className="min-h-24 font-mono text-xs" value={raw} onChange={(e) => setRaw(e.target.value)} placeholder={"Day\tTime\tRoom\nMonday\t[[1]]\tB2"} />
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-[var(--brand)]" checked={firstIsHeader} onChange={(e) => setFirstIsHeader(e.target.checked)} />
              First row is the header
            </label>
            <Button
              type="button"
              size="sm"
              variant="brand"
              disabled={!raw.trim()}
              onClick={() => {
                applyGrid(parseGrid(raw), firstIsHeader);
                setRaw("");
                setImportOpen(false);
              }}
            >
              Replace table with pasted cells
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse">
          <caption className="sr-only">Table cells. Type [[number]] in a cell to place a blank.</caption>
          {hasHeader && (
            <thead>
              <tr className="bg-ink-soft">
                {Array.from({ length: cols }, (_, c) => (
                  <th key={c} className="min-w-36 border-b border-r border-border p-1 last:border-r-0">
                    <Input className="h-9 rounded-lg border-transparent bg-transparent font-semibold" value={headers[c] ?? ""} onChange={(e) => setHeader(c, e.target.value)} aria-label={`Header, column ${c + 1}`} placeholder={`Heading ${c + 1}`} />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                {Array.from({ length: cols }, (_, c) => (
                  <td key={c} className="min-w-36 border-r border-t border-border p-1 last:border-r-0">
                    <Input
                      className="h-9 rounded-lg border-transparent bg-transparent"
                      value={row[c] ?? ""}
                      onChange={(e) => setCell(r, c, e.target.value)}
                      onPaste={(e) => onCellPaste(e, r, c)}
                      aria-label={`Row ${r + 1}, column ${c + 1}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">
        Type <code className="rounded bg-ink-soft px-1">[[{nextBlank}]]</code> in a cell to make it the blank for question {nextBlank}. You can paste a block of cells straight into the grid.
      </p>
    </div>
  );
}

function Stepper({ label, value, onMinus, onPlus, minusOff, plusOff }: { label: string; value: number; onMinus: () => void; onPlus: () => void; minusOff: boolean; plusOff: boolean }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-surface px-1.5 py-1" role="group" aria-label={label}>
      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onMinus} disabled={minusOff} aria-label={`Remove last ${label.toLowerCase().slice(0, -1)}`}>
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <span className="min-w-[4.5rem] text-center text-sm font-medium" aria-live="polite">
        {value} {label.toLowerCase()}
      </span>
      <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onPlus} disabled={plusOff} aria-label={`Add a ${label.toLowerCase().slice(0, -1)}`}>
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
