#!/bin/bash
cd /home/team/shared/repository
git add src/actions/annualUpdate.ts
git commit -m "Fix missing imports in annualUpdate action - verified fix"
git push origin main
git push production main
