import { Card } from '../components/common/Card'
import { PageHeader } from '../components/common/PageHeader'

export function ComingSoonPage({ title, description }) {
  return (
    <>
      <PageHeader eyebrow="Prestito in Tasca CRM" title={title} description={description} />
      <Card className="coming-soon-card">
        <span aria-hidden="true">→</span>
        <div><h2>Sezione predisposta</h2><p>I dati e le operazioni saranno collegati nella fase dedicata.</p></div>
      </Card>
    </>
  )
}
