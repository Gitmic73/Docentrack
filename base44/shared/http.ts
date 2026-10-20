// Helper condiviso per le risposte di errore delle backend functions.
// Il dettaglio dell'eccezione viene registrato lato server (log) e NON restituito
// al chiamante: error.message può contenere nomi di entità, ID di record o
// internals dell'SDK/infrastruttura che l'utente non deve vedere.

export function internalErrorBody(error: unknown) {
  const detail = error instanceof Error ? error.message : String(error);
  console.error('[errore interno]', detail);
  return { error: 'Errore interno del server' };
}