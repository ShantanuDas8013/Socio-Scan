# Handling LF/CRLF Warnings in Git

On Windows, Git may warn that LF will be replaced by CRLF. This occurs because Windows uses CRLF, and Git is configured to automatically convert LF to CRLF.

## To suppress these warnings:

1. Enable automatic conversion with:

   ```
   git config --global core.autocrlf true
   ```

   This setting converts LF to CRLF on checkout and CRLF back to LF on commit.

2. Alternatively, to keep LF endings:
   ```
   git config --global core.autocrlf input
   ```
   With this setting, Git does not modify your LF endings on checkout.

These warnings are benign and indicate that Git is handling line endings as configured.
