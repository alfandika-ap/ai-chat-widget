import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { LoginCredentials } from '@/hooks/auth/useLogin';
import { useLogin } from '@/hooks/auth/useLogin';
import { Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Alert, AlertDescription } from '@/components/ui/alert';

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();
  const { mutate: login, isPending, error } = useLogin();

  // @ts-expect-error - error.response is not typed
  const errorMessage = error?.response?.data?.detail;

  const handleLogin = (data: LoginCredentials) => {
    login(data);
  };

  return (
    <form
      onSubmit={handleSubmit(handleLogin)}
      className="w-full max-w-[400px] mx-auto"
    >
      <Card className="border-none shadow-none">
        <CardHeader className="space-y-3">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src="https://carabaobilliards.com/wp-content/uploads/2023/06/logo-website-carabao-2023.png"
                alt="Carabao AI"
              />
              <AvatarFallback>CA</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">Welcome Back</CardTitle>
              <CardDescription className="text-sm">
                Sign in to continue to Carabao AI
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              {...register('username', {
                required: 'Username is required',
              })}
              className={
                errors.username
                  ? 'border-red-500 focus-visible:ring-red-500'
                  : ''
              }
            />
            {errors.username && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.username.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              className={
                errors.password
                  ? 'border-red-500 focus-visible:ring-red-500'
                  : ''
              }
            />
            {errors.password && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.password.message}
              </p>
            )}
          </div>
          {error && (
            <Alert variant="destructive" className="text-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button disabled={isPending} className="w-full h-11">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Created by Carabao Billiards
          </p>
        </CardFooter>
      </Card>
    </form>
  );
}

export default LoginForm;
