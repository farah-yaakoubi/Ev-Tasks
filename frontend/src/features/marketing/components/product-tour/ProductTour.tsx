import { useState } from 'react';
import { Header } from './Header';
import { DataSection,FeatureGrid,FeatureTabs,Faq,FinalCta,GoalsSection,Hero,TemplateSection } from './Sections';
import { DemoModal } from './DemoModal';
import { Footer } from './Footer';
export default function ProductTour(){const [demoOpen,setDemoOpen]=useState(false);return <div className="product-tour"><a className="skip-link" href="#contenu">Aller au contenu</a><Header onDemo={()=>setDemoOpen(true)}/><main id="contenu"><Hero onDemo={()=>setDemoOpen(true)}/><GoalsSection/><FeatureTabs/><FeatureGrid/><DataSection/><TemplateSection onDemo={()=>setDemoOpen(true)}/><Faq/><FinalCta onDemo={()=>setDemoOpen(true)}/></main><Footer/><DemoModal open={demoOpen} onClose={()=>setDemoOpen(false)}/></div>}
