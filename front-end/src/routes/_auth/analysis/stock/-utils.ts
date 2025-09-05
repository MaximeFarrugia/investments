export const moneyAmountFormatter = (value: number) => {
  if (Math.abs(value) >= 1e9) {
    return (value / 1e9).toFixed(0) + 'B'
  } else if (Math.abs(value) >= 1e6) {
    return (value / 1e6).toFixed(0) + 'M'
  } else if (Math.abs(value) >= 1e3) {
    return (value / 1e3).toFixed(0) + 'K'
  }
  return value.toString()
}

export const getBarMap = (
  concepts: Record<
    string,
    Array<{ concept: string; label: string; color: string }>
  >,
) => {
  const res: Array<{
    category: string
    concept: string
    label: string
    color: string
  }> = []

  for (const [category, conceptList] of Object.entries(concepts)) {
    for (const concept of conceptList) {
      if (res.findIndex((e) => e.label === concept.label) === -1) {
        res.push({
          category,
          ...concept,
        })
      }
    }
  }
  return res
}

export const initHiddenBars = (
  concepts: Record<
    string,
    Array<{ concept: string; label: string; color: string }>
  >,
) => {
  const res: Record<string, boolean> = {}

  for (const [, conceptList] of Object.entries(concepts)) {
    for (const concept of conceptList) {
      if (res[concept.label] === undefined) {
        res[concept.label] = false
      }
    }
  }
  return res
}
