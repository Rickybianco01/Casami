import { useState } from 'react'
import { Biscotto } from '../mascot/Biscotto'
import { Button } from '../components/Button'
import { useSettingsStore } from '../stores/settingsStore'
import { it } from '@shared/i18n'

const steps = [it.welcome.step1, it.welcome.step2, it.welcome.step3]

export function Welcome() {
  const [idx, setIdx] = useState(0)
  const updateSettings = useSettingsStore((s) => s.update)
  const isLast = idx === steps.length - 1

  async function finish() {
    await updateSettings({ firstLaunchDone: true })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 text-center">
      <Biscotto mood={isLast ? 'cheer' : 'happy'} size={180} />
      {idx === 0 ? (
        <>
          <h1 className="text-4xl font-heading font-bold mt-4">{it.welcome.title}</h1>
          <p className="text-ink-500 mt-3 max-w-md text-lg">{it.welcome.sub}</p>
        </>
      ) : null}
      <div className="card mt-6 max-w-md w-full">
        <p className="text-xl">{steps[idx]}</p>
      </div>
      <div className="flex gap-3 mt-6">
        <Button
          variant="ghost"
          onClick={finish}
          size="lg"
        >
          {it.welcome.skip}
        </Button>
        <Button
          onClick={() => (isLast ? finish() : setIdx(idx + 1))}
          size="lg"
        >
          {isLast ? it.welcome.start : 'Avanti'}
        </Button>
      </div>
      <div className="flex gap-2 mt-6">
        {steps.map((_, i) => (
          <span
            key={i}
            className={`h-2 w-6 rounded-full ${i === idx ? 'bg-terra-500' : 'bg-cream-300'}`}
          />
        ))}
      </div>
    </div>
  )
}
