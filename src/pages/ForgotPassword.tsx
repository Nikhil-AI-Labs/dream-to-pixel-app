import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border bg-card">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-neon/20 border border-neon/50 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-neon" />
              </div>
              <h2 className="text-xl font-mono font-bold text-primary">Check Your Email</h2>
              <p className="text-muted-foreground">
                We've sent a password reset link to <span className="text-primary">{email}</span>
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary/20 border border-primary/50 flex items-center justify-center glow-electric">
            <span className="font-mono font-bold text-primary text-2xl">F</span>
          </div>
          <h1 className="text-3xl font-mono font-bold text-primary text-glow-electric">
            FORGER
          </h1>
          <p className="text-muted-foreground mt-2">
            Reset your password
          </p>
        </div>

        {/* Reset Form */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-center text-lg font-mono">Forgot Password</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <p className="text-sm text-muted-foreground mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-primary">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-secondary border-border"
                    placeholder="Enter your email"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="text-sm text-primary hover:text-primary/80 inline-flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
