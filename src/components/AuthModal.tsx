
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, LogIn, UserPlus } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: {username: string, email: string}) => void;
}

const AuthModal = ({ isOpen, onClose, onLogin }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      return;
    }

    onLogin({
      username: formData.username.trim(),
      email: formData.email.trim()
    });

    setFormData({ username: '', email: '', password: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-800/95 to-purple-800/95 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-base font-medium text-slate-300 mb-2 block">
                اسم المستخدم *
              </Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="أدخل اسم المستخدم..."
                  className="pr-10 py-3 border-slate-600 bg-slate-700/50 text-slate-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-base font-medium text-slate-300 mb-2 block">
                البريد الإلكتروني *
              </Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="أدخل البريد الإلكتروني..."
                  className="pr-10 py-3 border-slate-600 bg-slate-700/50 text-slate-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-base font-medium text-slate-300 mb-2 block">
                كلمة المرور *
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="أدخل كلمة المرور..."
                className="py-3 border-slate-600 bg-slate-700/50 text-slate-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                required
              />
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button
                type="submit"
                disabled={!formData.username.trim() || !formData.email.trim() || !formData.password.trim()}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLogin ? (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    تسجيل الدخول
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    إنشاء حساب
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="w-full py-3 border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700/50"
              >
                إلغاء
              </Button>
            </div>
          </form>

          <div className="text-center mt-4 pt-4 border-t border-slate-600/50">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              {isLogin ? 'ليس لديك حساب؟ أنشئ حساباً جديداً' : 'لديك حساب؟ سجل دخولك'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
