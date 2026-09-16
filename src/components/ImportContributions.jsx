import { useRef, useState } from 'react';
import { Check, FileSpreadsheet, Upload, X } from 'lucide-react';
import { currency } from '../utils/calculations';
import { parseContributionCSV } from '../utils/importContributions';

const SummaryMetric = ({ label, value, tone }) => (
  <div className={`import-metric ${tone}`}>
    <strong>{value}</strong>
    <span>{label}</span>
  </div>
);

const ImportContributions = ({ onImport }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [isCommitted, setIsCommitted] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please choose a CSV file.');
      setPreview(null);
      return;
    }

    const result = parseContributionCSV(await file.text());
    setError(result.ok ? '' : result.error);
    setIsCommitted(false);
    setPreview(result.ok ? result : null);
  };

  const handleFileChange = (event) => {
    processFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    processFile(event.dataTransfer.files?.[0]);
  };

  const confirmImport = () => {
    if (!preview) return;
    onImport(preview.members, preview.report);
    setIsCommitted(true);
    setError('');
  };

  return (
    <section className="card import-card">
      <div className="section-header">
        <div className="section-title-wrap">
          <span className="section-icon"><FileSpreadsheet size={16} /></span>
          <div>
            <p className="eyebrow">Data cleanup</p>
            <h2>Import Contributions</h2>
          </div>
        </div>
      </div>

      <p className="import-description">
        Upload a CSV to clean duplicate rows, normalize names, merge separate payments, and review rejected records before they reach your pool.
      </p>

      <div
        className={`import-dropzone ${isDragging ? 'is-dragging' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Upload size={22} />
        <strong>Drop a CSV file here</strong>
        <span>Expected columns: Name, Amount</span>
        <button type="button" className="secondary with-icon" onClick={() => inputRef.current?.click()}>
          <FileSpreadsheet size={16} />
          Choose CSV File
        </button>
        <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={handleFileChange} hidden />
      </div>

      {error ? <p className="error-text import-error">{error}</p> : null}

      {preview ? (
        <div className="import-preview">
          <div className="import-preview-header">
            <div>
              <p className="eyebrow">{isCommitted ? 'Import Complete' : 'Import Preview'}</p>
              <h3>{isCommitted ? 'Cleaned data added to the pool' : 'Review cleaned data'}</h3>
            </div>
            <span className={`status-badge ${isCommitted ? 'success' : 'neutral'}`}>
              {isCommitted ? 'Imported' : 'Ready to import'}
            </span>
          </div>

          <div className="import-metrics">
            <SummaryMetric label="Rows processed" value={preview.report.totalRows} tone="violet" />
            <SummaryMetric label="Imported" value={preview.report.importedCount} tone="green" />
            <SummaryMetric label="De-duplicated" value={preview.report.duplicateCount} tone="blue" />
            <SummaryMetric label="Merged" value={preview.report.mergedCount} tone="amber" />
            <SummaryMetric label="Rejected" value={preview.report.rejectedCount} tone="red" />
          </div>

          <div className="import-report-grid">
            <details open>
              <summary>Imported records ({preview.report.importedCount})</summary>
              <div className="import-report-list">
                {preview.report.imported.length ? preview.report.imported.map((record) => (
                  <div className="import-report-row" key={`imported-${record.rowNumber}`}>
                    <span>{record.name}</span>
                    <strong>{currency(record.amount)}</strong>
                  </div>
                )) : <span className="report-muted">No valid records found.</span>}
              </div>
            </details>

            <details>
              <summary>De-duplicated ({preview.report.duplicateCount})</summary>
              <div className="import-report-list">
                {preview.report.deduplicated.length ? preview.report.deduplicated.map((record) => (
                  <div className="import-report-row report-rejected" key={`duplicate-${record.rowNumber}`}>
                    <span>Row {record.rowNumber}: {record.name}</span>
                    <small>{currency(record.amount)} · duplicate of row {record.duplicateOf}</small>
                  </div>
                )) : <span className="report-muted">No duplicate rows found.</span>}
              </div>
            </details>

            <details>
              <summary>Merged payments ({preview.report.mergedCount})</summary>
              <div className="import-report-list">
                {preview.report.merged.length ? preview.report.merged.map((group) => (
                  <div className="import-report-row" key={`merged-${group.normalizedName || group.name}`}>
                    <span>{group.name}</span>
                    <small>{group.expression} = {currency(group.total)}</small>
                  </div>
                )) : <span className="report-muted">No separate payments needed merging.</span>}
              </div>
            </details>

            <details>
              <summary>Rejected rows ({preview.report.rejectedCount})</summary>
              <div className="import-report-list">
                {preview.report.rejected.length ? preview.report.rejected.map((record) => (
                  <div className="import-report-row report-rejected" key={`rejected-${record.rowNumber}`}>
                    <span>Row {record.rowNumber}: {record.original}</span>
                    <small>{record.reason}</small>
                  </div>
                )) : <span className="report-muted">No rows were rejected.</span>}
              </div>
            </details>
          </div>

          <p className="import-assumption">
            Cleaning rule: rows with the same normalized name and amount are treated as repeated copies and de-duplicated. Different amounts for the same normalized name are treated as separate payments and merged.
          </p>

          {!isCommitted ? (
            <div className="import-actions">
              <button type="button" className="secondary with-icon" onClick={() => setPreview(null)}>
                <X size={16} />
                Cancel
              </button>
              <button type="button" className="primary with-icon" onClick={confirmImport}>
                <Check size={16} />
                Import Cleaned Data
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};

export default ImportContributions;
