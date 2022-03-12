import type { Result, ProcessedResult } from './index';

export default function processResults(results: Result[]): ProcessedResult[] {
  const processed = results.reduce((acc = [], item) => {
    const index = acc.findIndex((n) => n.name === item.name);

    if (index !== -1) {
      acc[index].count = acc[index].count + 1;
      acc[index].instances.push(item);
      return acc;
    }

    acc.push({
      name: item.name,
      count: 1,
      instances: [item]
    });

    return acc;
  }, [] as ProcessedResult[]);

  return processed;
}
