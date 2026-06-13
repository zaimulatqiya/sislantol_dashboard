'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { Save, User, Camera, Trash2, X, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function ProfilPage() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    noHp: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [passwordData, setPasswordData] = useState({
    baru: '',
    konfirmasi: ''
  });
  
  const [isUpdatingProfil, setIsUpdatingProfil] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nama: user.nama || '',
        email: user.email || '',
        noHp: user.noHp || '',
      });
    }
  }, [user]);

  const handleUpdateProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfil(true);
    
    const success = await updateUser({
      nama: formData.nama,
      noHp: formData.noHp
    });
    
    setIsUpdatingProfil(false);
    if (success) {
      toast.success('Profil berhasil diperbarui!');
    } else {
      toast.error('Gagal memperbarui profil.');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.baru !== passwordData.konfirmasi) {
      toast.error('Konfirmasi password baru tidak cocok!');
      return;
    }
    
    setIsUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({
      password: passwordData.baru
    });
    setIsUpdatingPassword(false);
    
    if (error) {
      toast.error('Gagal memperbarui password: ' + error.message);
    } else {
      toast.success('Password berhasil diperbarui!');
      setPasswordData({ baru: '', konfirmasi: '' });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 2MB");
        return;
      }
      
      toast.loading("Mengunggah foto...", { id: 'upload-foto' });
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        toast.error("Gagal mengunggah foto: " + uploadError.message, { id: 'upload-foto' });
        return;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const success = await updateUser({ profileImage: data.publicUrl });
      
      if (success) {
        toast.success('Foto profil berhasil diubah!', { id: 'upload-foto' });
      } else {
        toast.error('Gagal menyimpan foto ke profil.', { id: 'upload-foto' });
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateUser({ profileImage: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <PageHeader 
        title="Profil Pengguna" 
        description="Kelola informasi akun dan keamanan Anda."
      />

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 space-y-6">
          <Card className="border-gray-200">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="relative group">
                <div 
                  className="w-28 h-28 relative rounded-full bg-blue-100 flex items-center justify-center mb-4 border-4 border-white shadow-xl overflow-hidden cursor-pointer"
                  onClick={triggerFileInput}
                >
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-blue-600" />
                  )}
                  
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white mb-1" />
                    <span className="text-[10px] text-white font-medium">Ubah Foto</span>
                  </div>
                </div>

                {/* Remove Button */}
                {user?.profileImage && (
                  <button 
                    onClick={handleRemoveImage}
                    className="absolute -top-1 -right-1 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors"
                    title="Hapus foto"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}

                {/* Hidden Input */}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <h3 className="text-xl font-bold text-gray-900 leading-tight">{user?.nama}</h3>
              <p className="text-sm text-gray-500 capitalize mb-4">{user?.role} / Surabaya-Gempol</p>
              
              <div className="w-full bg-slate-50 border border-slate-100 text-slate-600 text-xs py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                ADMIN AKTIF
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3 space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
              <CardDescription>Perbarui nama dan nomor HP yang dapat dihubungi.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfil} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nama">Nama Lengkap</Label>
                    <Input id="nama" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="bg-white" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="noHp">Nomor HP</Label>
                    <Input id="noHp" value={formData.noHp} onChange={e => setFormData({...formData, noHp: e.target.value})} className="bg-white" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} disabled className="bg-gray-50 cursor-not-allowed" />
                    <p className="text-xs text-gray-500">Email tidak dapat diubah karena merupakan ID akun Anda.</p>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isUpdatingProfil} className="bg-blue-600 hover:bg-blue-700">
                    {isUpdatingProfil ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Simpan Perubahan
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Ubah Password</CardTitle>
              <CardDescription>Pastikan akun Anda menggunakan password yang kuat dan aman.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="baru">Password Baru</Label>
                  <Input id="baru" type="password" required value={passwordData.baru} onChange={e => setPasswordData({...passwordData, baru: e.target.value})} className="bg-white max-w-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="konfirmasi">Konfirmasi Password Baru</Label>
                  <Input id="konfirmasi" type="password" required value={passwordData.konfirmasi} onChange={e => setPasswordData({...passwordData, konfirmasi: e.target.value})} className="bg-white max-w-sm" />
                </div>
                <div className="flex justify-end pt-2">
                  <Button type="submit" variant="outline" disabled={isUpdatingPassword} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                    {isUpdatingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Perbarui Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
