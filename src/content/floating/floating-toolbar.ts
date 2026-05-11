export interface ToolbarRefs {
  el: HTMLElement;
  searchInput: HTMLInputElement;
}

export interface ToolbarDeps {
  onSearch: (query: string) => void;
  onSubmit: (text: string) => Promise<void>;
  onEscape: () => void;
}

export function buildToolbar(deps: ToolbarDeps): ToolbarRefs {
  const tools = document.createElement('div');
  tools.className = 'cb-tools';

  const search = document.createElement('input');
  search.type = 'search';
  search.className = 'cb-search';
  search.placeholder = '🔍 검색...';
  search.oninput = () => {
    deps.onSearch(search.value.trim().toLowerCase());
  };
  search.onkeydown = (e) => {
    if (e.key !== 'Escape') return;
    if (search.value) {
      search.value = '';
      deps.onSearch('');
    } else {
      deps.onEscape();
    }
  };
  tools.appendChild(search);

  const addWrap = document.createElement('div');
  addWrap.className = 'cb-add';
  const ta = document.createElement('textarea');
  ta.className = 'cb-textarea';
  ta.placeholder = '직접 입력 (Ctrl+Enter 로 추가)';
  ta.rows = 2;
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'cb-btn cb-btn-primary';
  addBtn.textContent = '+ 추가';

  const submit = async (): Promise<void> => {
    const value = ta.value.trim();
    if (!value) return;
    ta.value = '';
    await deps.onSubmit(value);
  };
  addBtn.onclick = () => void submit();
  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void submit();
    }
  });
  addWrap.appendChild(ta);
  addWrap.appendChild(addBtn);
  tools.appendChild(addWrap);

  return { el: tools, searchInput: search };
}
