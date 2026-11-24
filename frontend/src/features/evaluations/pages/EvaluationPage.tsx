import { useMemo, useState, type CSSProperties, type FormEvent } from 'react';
import { BarChart3, Check, Clock3, Lightbulb, ListChecks, MessageCircle, Pencil, Plus, Power, RotateCcw, Send, Star, Trash2, UsersRound, X } from 'lucide-react';
import { useStore } from '@/app/state/store';
import { useConfirmAction } from '@/shared/ui/ConfirmDialog';
import type { EvaluationPeriod } from '@/shared/types';
import './EvaluationPage.css';
import './EvaluationPage.redesign.css';

const periodNames: Record<EvaluationPeriod, string> = { daily: 'Journalière', monthly: 'Mensuelle', yearly: 'Annuelle' };
const today = () => new Date().toLocaleDateString('sv-SE');
const icons = [Star, Clock3, UsersRound, Lightbulb, MessageCircle];

export default function EvaluationPage() {
  const state = useStore();
  const confirm = useConfirmAction();
  const members = state.users.filter((user) => user.role === 'collaborateur');
  const activeCriteria = state.evaluationCriteria.filter((item) => item.active);
  const [memberId, setMemberId] = useState(() => useStore.getState().users.find((user) => user.role === 'collaborateur')?.id ?? '');
  const [period, setPeriod] = useState<EvaluationPeriod>('monthly');
  const [date, setDate] = useState(today());
  const [scores, setScores] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [comment, setComment] = useState('');
  const [criterionName, setCriterionName] = useState('');
  const [criterionDescription, setCriterionDescription] = useState('');
  const [maxScore, setMaxScore] = useState(5);
  const [saved, setSaved] = useState(false);
  const [criteriaDialogOpen, setCriteriaDialogOpen] = useState(false);
  const [criteriaDialogTab, setCriteriaDialogTab] = useState<'add' | 'manage'>('add');
  const [editingEvaluationId, setEditingEvaluationId] = useState<string | null>(null);
  const [editingCriterionId, setEditingCriterionId] = useState<string | null>(null);
  const ordered = useMemo(() => [...state.evaluations].sort((a, b) => b.evaluatedAt.localeCompare(a.evaluatedAt)), [state.evaluations]);
  const ratedCriteria = activeCriteria.filter((item) => scores[item.id] !== undefined);
  const globalScore = ratedCriteria.length ? ratedCriteria.reduce((sum, item) => sum + ((scores[item.id] ?? 0) / item.maxScore) * 5, 0) / ratedCriteria.length : 0;
  const selectedMember = members.find((user) => user.id === memberId);

  if (state.role !== 'directeur') return <div className="workspace-page evaluation-page"><header className="workspace-heading"><div><h1>Évaluations</h1><p>Cette page est réservée au directeur du service.</p></div></header></div>;

  const reset = () => { setScores({}); setNotes({}); setComment(''); };
  const clearEvaluation = () => { setMemberId(members[0]?.id ?? ''); setPeriod('monthly'); setDate(today()); reset(); setEditingEvaluationId(null); };
  const editEvaluation = (item: typeof ordered[number]) => {
    setMemberId(item.userId); setPeriod(item.period); setDate(item.evaluatedAt); setScores(item.scores); setNotes(item.notes); setComment(item.comment ?? ''); setEditingEvaluationId(item.id);
    document.querySelector('.evaluation-compose')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const createCriterion = (event: FormEvent) => {
    event.preventDefault();
    if (editingCriterionId) state.updateEvaluationCriterion(editingCriterionId, criterionName, criterionDescription, maxScore);
    else state.createEvaluationCriterion(criterionName, criterionDescription, maxScore);
    if (!useStore.getState().lastActionError) {
      setCriterionName(''); setCriterionDescription(''); setMaxScore(5);
      if (editingCriterionId) { setEditingCriterionId(null); setCriteriaDialogTab('manage'); }
      else setCriteriaDialogOpen(false);
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const input = { userId: memberId, period, evaluatedAt: date, scores, notes, comment };
    if (editingEvaluationId) state.updateMemberEvaluation(editingEvaluationId, input);
    else state.saveMemberEvaluation(input);
    if (!useStore.getState().lastActionError) {
      setSaved(true); clearEvaluation();
      window.setTimeout(() => setSaved(false), 2500);
    }
  };

  return <div className="workspace-page evaluation-page evaluation-page-reference">
    <header className="evaluation-reference-hero">
      <div className="evaluation-hero-mark"><UsersRound size={46}/><span><Star/><Star/><Star/></span></div>
      <div className="evaluation-hero-copy"><span className="eyebrow">ESPACE VERT · DIRECTION MARKETING</span><h1>Évaluation des membres</h1><p>Définissez les critères, choisissez un membre et attribuez une évaluation.</p></div>
    </header>

    <form className="evaluation-compose evaluation-reference-form" onSubmit={submit}>
      <main className="evaluation-main-column">
        <label className="evaluation-member-select">
          {selectedMember?.avatarDataUrl ? <img className="evaluation-selected-avatar" src={selectedMember.avatarDataUrl} alt=""/> : <span className="evaluation-member-icon"><UsersRound size={25}/></span>}
          <span className="evaluation-selected-copy"><small>Attribuer l’évaluation à</small><strong>{selectedMember?.name ?? 'Sélectionnez un membre'}</strong><span>{selectedMember ? `${selectedMember.title} · Service Marketing` : 'Choisissez un membre de votre équipe'}</span></span>
          <select value={memberId} onChange={(event) => setMemberId(event.target.value)} aria-label="Sélectionner un membre" required><option value="" disabled>Sélectionner un membre…</option>{members.map((user) => <option key={user.id} value={user.id}>{user.name} · {user.title}</option>)}</select>
          <span className="evaluation-member-chevron">⌄</span>
        </label>

        <div className="evaluation-section-title"><span className="evaluation-icon"><ListChecks size={26}/></span><div><h2>Critères d’évaluation</h2><p>Configurez les critères et évaluez chaque aspect</p></div></div>
        {activeCriteria.length === 0 ? <div className="evaluation-empty">Ajoutez d’abord des critères dans les paramètres ci-dessous.</div> : <div className="evaluation-criteria-list">{activeCriteria.map((criterion, index) => {
          const Icon = icons[index % icons.length];
          const selected = scores[criterion.id] === undefined ? '' : String(Math.round((scores[criterion.id] / criterion.maxScore) * 5));
          return <article className="evaluation-score-row" key={criterion.id}>
            <span className="evaluation-criterion-icon"><Icon size={31}/></span>
            <div className="evaluation-criterion-copy"><strong>{criterion.label}</strong><small>{criterion.description || 'Évaluez cet aspect du travail.'}</small><details className="evaluation-note-details"><summary>Commentaire sur ce critère (facultatif)</summary><input value={notes[criterion.id] ?? ''} onChange={(event) => setNotes((current) => ({ ...current, [criterion.id]: event.target.value }))} maxLength={500} placeholder="Précision facultative…"/></details></div>
            <label className="evaluation-rating-select"><span>Note</span><select value={selected} aria-label={`Note pour ${criterion.label}`} onChange={(event) => { const rating = Number(event.target.value); setScores((current) => { const next = { ...current }; if (!rating) delete next[criterion.id]; else next[criterion.id] = rating / 5 * criterion.maxScore; return next; }); }}><option value="">— / 5</option>{[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}</select></label>
          </article>;
        })}</div>}
        <button type="button" className="evaluation-add-criterion" onClick={() => { setEditingCriterionId(null); setCriterionName(''); setCriterionDescription(''); setMaxScore(5); setCriteriaDialogTab('add'); setCriteriaDialogOpen(true); }}><Plus size={20}/> Ajouter un critère personnalisé</button>
        <div className="evaluation-reference-meta"><label>Période<select value={period} onChange={(event) => setPeriod(event.target.value as EvaluationPeriod)}><option value="daily">Journalière</option><option value="monthly">Mensuelle</option><option value="yearly">Annuelle</option></select></label><label>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required/></label></div>
      </main>

      <aside className="evaluation-result"><header className="evaluation-result-heading"><Star size={43}/><div><strong>Détails de l’évaluation</strong><span>Ajoutez une note globale et un commentaire</span></div></header><section className="evaluation-comment">
        <div className="evaluation-global-label"><Star size={20} fill="currentColor"/><strong>Note globale</strong></div>
        <div className="evaluation-global-score"><div className="evaluation-gauge" style={{ '--score-angle': `${(globalScore / 5) * 360}deg` } as CSSProperties}><strong>{globalScore ? globalScore.toFixed(1).replace('.', ',') : '—'}</strong><span>/ 5</span></div><span className="evaluation-sentiment"><Star size={22}/>{globalScore >= 4.5 ? 'Très satisfait' : globalScore >= 3.5 ? 'Satisfait' : globalScore >= 2.5 ? 'À améliorer' : 'En attente des notes'}</span></div>
        <label htmlFor="evaluation-general-comment"><MessageCircle size={21} fill="currentColor"/><strong>Commentaire</strong></label><textarea id="evaluation-general-comment" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1000} placeholder="Ajoutez vos commentaires ici…"/><span className="evaluation-count">{comment.length} / 1000</span>
        <div className="evaluation-actions"><button type="button" className="evaluation-reset" onClick={reset}><RotateCcw size={18}/> Réinitialiser</button><button className="evaluation-submit" type="submit" disabled={!memberId || activeCriteria.length === 0 || ratedCriteria.length === 0}><Send size={20}/> {editingEvaluationId ? 'Enregistrer les modifications' : 'Soumettre l’évaluation'}</button></div>{saved && <p className="evaluation-saved"><Check size={15}/> Évaluation enregistrée.</p>}
      </section></aside>
    </form>

    {criteriaDialogOpen && <div className="criteria-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCriteriaDialogOpen(false); }}>
      <section className="criteria-dialog" role="dialog" aria-modal="true" aria-labelledby="criteria-dialog-title">
        <header className="criteria-dialog-header"><span className="criteria-dialog-icon"><ListChecks size={22}/></span><div><h2 id="criteria-dialog-title">Critères d’évaluation</h2><p>Ajoutez et gérez les critères de votre équipe.</p></div><button type="button" className="criteria-dialog-close" aria-label="Fermer" onClick={() => setCriteriaDialogOpen(false)}><X size={19}/></button></header>
        <div className="criteria-dialog-tabs" role="tablist" aria-label="Gestion des critères"><button type="button" role="tab" aria-selected={criteriaDialogTab === 'add'} className={criteriaDialogTab === 'add' ? 'active' : ''} onClick={() => { setCriteriaDialogTab('add'); setEditingCriterionId(null); setCriterionName(''); setCriterionDescription(''); setMaxScore(5); }}><Plus size={15}/> Ajouter un critère</button><button type="button" role="tab" aria-selected={criteriaDialogTab === 'manage'} className={criteriaDialogTab === 'manage' ? 'active' : ''} onClick={() => setCriteriaDialogTab('manage')}>Critères existants <span>{state.evaluationCriteria.length}</span></button></div>
        {criteriaDialogTab === 'add' ? <form className="criteria-dialog-form" onSubmit={createCriterion}><label>Nom du critère<input autoFocus value={criterionName} onChange={(event) => setCriterionName(event.target.value)} maxLength={80} placeholder="Ex. Qualité du travail" required/></label><label>Description <small>(facultatif)</small><textarea value={criterionDescription} onChange={(event) => setCriterionDescription(event.target.value)} maxLength={240} placeholder="Décrivez ce qui sera évalué…"/></label><label>Note maximale<input type="number" min="1" max="10" value={maxScore} onChange={(event) => setMaxScore(Number(event.target.value))} required/></label><footer><button type="button" className="criteria-dialog-cancel" onClick={() => setCriteriaDialogOpen(false)}>Annuler</button><button type="submit" className="evaluation-submit"><Plus size={17}/> Ajouter le critère</button></footer></form> : <div className="criteria-dialog-list">{state.evaluationCriteria.length === 0 ? <p className="evaluation-empty">Aucun critère enregistré.</p> : state.evaluationCriteria.map((criterion) => <article key={criterion.id}><span className="criteria-dialog-list-copy"><strong>{criterion.label}</strong><small>{criterion.description || `Note sur ${criterion.maxScore}`}</small></span><button type="button" className={`criterion-toggle ${criterion.active ? 'active' : ''}`} role="switch" aria-checked={criterion.active} aria-label={`${criterion.active ? 'Désactiver' : 'Activer'} ${criterion.label}`} onClick={() => state.setEvaluationCriterionActive(criterion.id, !criterion.active)}><Power size={14}/></button><button type="button" className="criterion-edit" aria-label={`Modifier ${criterion.label}`} onClick={() => { setEditingCriterionId(criterion.id); setCriterionName(criterion.label); setCriterionDescription(criterion.description); setMaxScore(criterion.maxScore); setCriteriaDialogTab('add'); }}><Pencil size={14}/></button><button type="button" className="criterion-delete" aria-label={`Supprimer ${criterion.label}`} onClick={async() => { if (await confirm({title:'Supprimer ce critère ?',message:`Le critère « ${criterion.label} » et ses notes dans les évaluations seront supprimés.`,confirmLabel:'Supprimer'})) state.deleteEvaluationCriterion(criterion.id); }}><Trash2 size={14}/></button></article>)}</div>}
      </section>
    </div>}

    {state.lastActionError && <p className="evaluation-error" role="alert">{state.lastActionError}</p>}
    <details className="evaluation-history-panel"><summary>Historique récent <span>{ordered.length} évaluation(s)</span></summary><div className="evaluation-history">{ordered.length === 0 ? <div className="evaluation-empty">Aucune évaluation n’a encore été enregistrée.</div> : ordered.slice(0, 12).map((item) => { const member = state.users.find((user) => user.id === item.userId); const values = Object.entries(item.scores).filter(([id]) => state.evaluationCriteria.some((criterion) => criterion.id === id)); const average = values.length ? values.reduce((sum, [id, value]) => sum + (value / (state.evaluationCriteria.find((criterion) => criterion.id === id)?.maxScore ?? 10)) * 5, 0) / values.length : 0; return <article key={item.id}><span className="evaluation-member-avatar">{member?.avatarDataUrl ? <img src={member.avatarDataUrl} alt=""/> : member?.name.split(' ').map((part) => part[0]).join('') ?? '?'}</span><span className="evaluation-history-member"><strong>{member?.name ?? 'Membre'}</strong><small>{periodNames[item.period]} · {new Date(item.evaluatedAt + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</small></span><span className="evaluation-average">{average.toFixed(1)}<small>/5</small></span><div className="evaluation-history-actions"><button type="button" title="Modifier l’évaluation" aria-label="Modifier l’évaluation" onClick={() => editEvaluation(item)}><Pencil size={15}/></button><button type="button" className="danger" title="Supprimer l’évaluation" aria-label="Supprimer l’évaluation" onClick={async() => { if (await confirm({title:'Supprimer cette évaluation ?',message:`L’évaluation de ${member?.name ?? 'ce membre'} sera supprimée définitivement.`,confirmLabel:'Supprimer'})) state.deleteMemberEvaluation(item.id); }}><Trash2 size={15}/></button></div></article>; })}</div></details>
  </div>;
}
