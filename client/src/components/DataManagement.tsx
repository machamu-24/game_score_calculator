import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Database, Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { useHistory } from "@/contexts/HistoryContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DataManagement() {
  const { exportHistory, importHistory } = useHistory();
  const [isOpen, setIsOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportHistory();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mahjong_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = await importHistory(content);
        setImportStatus(success ? 'success' : 'error');
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) setImportStatus('idle');
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <Database className="w-4 h-4" />
          データ管理（バックアップ）
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-panel border-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            データ管理
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">データの書き出し</h3>
            <p className="text-sm">
              現在の対戦履歴をファイルとして保存します。機種変更や友達へのデータ共有に使えます。
            </p>
            <Button onClick={handleExport} className="w-full gap-2" variant="secondary">
              <Download className="w-4 h-4" />
              データを書き出す（保存）
            </Button>
          </div>

          <div className="border-t border-border/50 my-4" />

          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">データの読み込み</h3>
            <p className="text-sm">
              書き出したファイルを読み込んで、履歴を追加します。
              <br />
              <span className="text-xs text-muted-foreground">※既存のデータは消えずに、新しいデータが追加されます。</span>
            </p>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            
            <Button onClick={handleImportClick} className="w-full gap-2" variant="outline">
              <Upload className="w-4 h-4" />
              データを読み込む
            </Button>

            {importStatus === 'success' && (
              <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>完了</AlertTitle>
                <AlertDescription>
                  データの読み込みに成功しました。
                </AlertDescription>
              </Alert>
            )}

            {importStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>エラー</AlertTitle>
                <AlertDescription>
                  ファイルの読み込みに失敗しました。正しいデータファイルか確認してください。
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>閉じる</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
