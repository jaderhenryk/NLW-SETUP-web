import * as Checkbox from '@radix-ui/react-checkbox';
import dayjs from 'dayjs';
import { Check } from 'phosphor-react';
import { useEffect, useState } from 'react';
import { api } from '../lib/axios';

interface HabitListProps {
  date: Date
  onCompletedChange: (completed: number) => void
}

interface HabitsInfo {
  habits: {
    id:         string
    title:      string
    created_at: string
  }[],
  completedHabits: string[]
}

export function HabitsList({ date, onCompletedChange }: HabitListProps) {
  const [ habitsInfo, setHabitsInfo ] = useState<HabitsInfo>()
  useEffect(() => {
    api.get('days', {
      params: {
        date: date.toISOString()
      }
    }).then(response => {
      setHabitsInfo(response.data)
    })
  }, [])

  const isDateInPast = dayjs(date).endOf('day').isBefore(new Date())

  async function handleToggleHabit(habit_id: string) {
    await api.patch(`/habits/${habit_id}/toggle`)
    const isHabitCompleted = habitsInfo!.completedHabits.includes(habit_id)
    let completedHabits: string[] = []
    if (isHabitCompleted) {
      completedHabits = habitsInfo!.completedHabits.filter(id => id !== habit_id)
    } else {
      completedHabits = [...habitsInfo!.completedHabits, habit_id]
    }
    setHabitsInfo({
      completedHabits,
      habits: habitsInfo!.habits
    })
    onCompletedChange(completedHabits.length)
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
    {
      habitsInfo?.habits.map(habit => (
        <Checkbox.Root 
          key={habit.id}
          className="flex items-center gap-3 group focus:outline-none disabled:cursor-not-allowed"
          checked={habitsInfo.completedHabits.includes(habit.id)}
          disabled={isDateInPast}
          onCheckedChange={() => handleToggleHabit(habit.id)}
        >
          <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-900 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500 transition-colors group-focus:ring-2 group-focus:ring-violet-700 group-focus:ring-offset-2 group-focus:ring-offset-background">
            <Checkbox.Indicator>
              <Check size={20} className="text-white"/>
            </Checkbox.Indicator>
          </div>
          <span className="font-semibold text-xl text-white leading-tight group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400">
            {habit.title}
          </span>
        </Checkbox.Root>
      ))
    }
    </div>
  )
}