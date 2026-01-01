import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RotateCcw } from "lucide-react";

type EndGameDialogProps = {
  isOpen: boolean;
  message: string;
  onRestart: () => void;
};

export default function EndGameDialog({ isOpen, message, onRestart }: EndGameDialogProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline text-2xl">Fim de Jogo!</AlertDialogTitle>
          <AlertDialogDescription className="text-base pt-4">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onRestart}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Jogar Novamente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
