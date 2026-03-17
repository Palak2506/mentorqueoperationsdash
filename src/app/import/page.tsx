"use client";

import { useState, FormEvent } from "react";

export default function ImportPage() {
  const [status, setStatus] = useState<null | string>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File | null;

    if (!file) {
      setStatus("Please choose a CSV file first.");
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/import/candidates", {
        method: "POST",
        body: formData
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus(data.error ?? "Import failed. Please try again.");
      } else {
        setStatus(
          `Imported ${data.candidatesImported ?? 0} candidates and ${data.actionsImported ?? 0} actions.`
        );
      }
    } catch (err) {
      console.error(err);
      setStatus("Unexpected error while importing.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Import Mentorque OPS Tracker</h2>
        <p className="mt-1 text-sm text-slate-300">
          Upload the <span className="font-mono">mtq_ops_tracker.csv</span> file to load
          candidates and their actions into the dashboard. This uses a local SQLite
          database only.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-800 p-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-100">
            CSV file
            <input
              type="file"
              name="file"
              accept=".csv,text/csv"
              className="mt-2 block w-full text-sm text-slate-200 file:mr-4 file:rounded-md file:border-0 file:bg-slate-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-50 hover:file:bg-slate-600"
            />
          </label>
          <p className="text-xs text-slate-400">
            Expected format: the same structure as your Google Sheet export (actions as rows,
            each candidate in its own group of columns).
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center rounded-md bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Importing..." : "Import CSV"}
        </button>

        {status && (
          <p className="text-sm text-slate-200">
            {status}
          </p>
        )}
      </form>
    </div>
  );
}

