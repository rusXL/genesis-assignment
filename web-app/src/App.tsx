import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios, {AxiosError} from "axios"
import { Toaster, toast } from "sonner"

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error('API URL is missing in .env');
}

const formSchema = z.object({
  email: z.string().email(),
  city: z.string().min(2),
  frequency: z.enum(["hourly", "daily"]),
})

export default function App() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      frequency: "daily"
    }
  })
 
  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("submit")
    try {
      const response = await axios.post(`${API_URL}/subscribe`, values)
      toast("Subcribed successfully", {
        description: response.data.message
      })

      console.log(response.data)
    } catch (err: unknown) {
      const error = err as AxiosError;
       toast("Error", {
        description: error.message
      })

      console.error(err)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <Toaster />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 sm:w-[360px]">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="example@example.com" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Kyiv" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency of updates" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="daily">daily</SelectItem>
                    <SelectItem value="hourly">hourly</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  )
}
