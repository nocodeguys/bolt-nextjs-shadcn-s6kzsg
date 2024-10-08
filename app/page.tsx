import PatientForm from '@/components/PatientForm'
import MealPlanManager from '@/components/MealPlanManager'

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dietitian Meal Planner</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PatientForm />
        <MealPlanManager />
      </div>
    </div>
  )
}