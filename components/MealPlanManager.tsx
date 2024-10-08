'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const mealFormSchema = z.object({
  day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  name: z.string().min(2, { message: "Meal name must be at least 2 characters." }),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
})

type Meal = z.infer<typeof mealFormSchema>
type WeeklyMeals = Record<Meal['day'], Meal[]>

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

export default function MealPlanManager() {
  const [meals, setMeals] = useState<WeeklyMeals>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  })
  const [currentDay, setCurrentDay] = useState<Meal['day']>('monday')
  const [currentCalories, setCurrentCalories] = useState(0)
  const [macroPercentages, setMacroPercentages] = useState({ protein: 0, carbs: 0, fat: 0 })

  const form = useForm<Meal>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: {
      day: 'monday',
      name: "",
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  })

  useEffect(() => {
    calculateTotals(currentDay)
  }, [meals, currentDay])

  function calculateTotals(day: Meal['day']) {
    const dayMeals = meals[day]
    const totalProtein = dayMeals.reduce((sum, meal) => sum + meal.protein, 0)
    const totalCarbs = dayMeals.reduce((sum, meal) => sum + meal.carbs, 0)
    const totalFat = dayMeals.reduce((sum, meal) => sum + meal.fat, 0)

    const totalCalories = totalProtein * 4 + totalCarbs * 4 + totalFat * 9
    setCurrentCalories(totalCalories)

    const proteinPercentage = (totalProtein * 4 / totalCalories) * 100
    const carbsPercentage = (totalCarbs * 4 / totalCalories) * 100
    const fatPercentage = (totalFat * 9 / totalCalories) * 100

    setMacroPercentages({
      protein: isNaN(proteinPercentage) ? 0 : proteinPercentage,
      carbs: isNaN(carbsPercentage) ? 0 : carbsPercentage,
      fat: isNaN(fatPercentage) ? 0 : fatPercentage,
    })
  }

  function onSubmit(values: Meal) {
    setMeals(prevMeals => ({
      ...prevMeals,
      [values.day]: [...prevMeals[values.day], values]
    }))
    form.reset()
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Weekly Meal Plan Manager</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="day"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Day</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DAYS.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meal Name</FormLabel>
                <FormControl>
                  <Input placeholder="Breakfast" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="protein"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Protein (g)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(+e.target.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="carbs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carbs (g)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(+e.target.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fat (g)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(+e.target.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Add Meal</Button>
        </form>
      </Form>

      <Tabs value={currentDay} onValueChange={(value) => setCurrentDay(value as Meal['day'])} className="mt-6">
        <TabsList>
          {DAYS.map((day) => (
            <TabsTrigger key={day} value={day}>
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
        {DAYS.map((day) => (
          <TabsContent key={day} value={day}>
            <Card>
              <CardHeader>
                <CardTitle>{day.charAt(0).toUpperCase() + day.slice(1)} Meal Nutrition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold mb-2">{currentCalories.toFixed(0)} calories</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Protein</span>
                    <span>{macroPercentages.protein.toFixed(1)}%</span>
                  </div>
                  <Progress value={macroPercentages.protein} className="bg-blue-200" indicatorColor="bg-blue-500" />
                  <div className="flex justify-between items-center">
                    <span>Carbs</span>
                    <span>{macroPercentages.carbs.toFixed(1)}%</span>
                  </div>
                  <Progress value={macroPercentages.carbs} className="bg-green-200" indicatorColor="bg-green-500" />
                  <div className="flex justify-between items-center">
                    <span>Fat</span>
                    <span>{macroPercentages.fat.toFixed(1)}%</span>
                  </div>
                  <Progress value={macroPercentages.fat} className="bg-yellow-200" indicatorColor="bg-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Table className="mt-6">
              <TableCaption>List of meals for {day}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Meal</TableHead>
                  <TableHead>Protein (g)</TableHead>
                  <TableHead>Carbs (g)</TableHead>
                  <TableHead>Fat (g)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meals[day].map((meal, index) => (
                  <TableRow key={index}>
                    <TableCell>{meal.name}</TableCell>
                    <TableCell>{meal.protein}</TableCell>
                    <TableCell>{meal.carbs}</TableCell>
                    <TableCell>{meal.fat}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}