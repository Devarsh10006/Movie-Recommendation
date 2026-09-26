import os
import json
from pathlib import Path
from typing import Dict, Any
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    roc_curve,
    auc,
    precision_recall_curve,
    average_precision_score,
    confusion_matrix
)
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend safe for server threads
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from app.core.config import settings
from app.core.logging import logger

def evaluate_models(
    model,
    test_df: pd.DataFrame,
    movies_df: pd.DataFrame = None,
    max_eval_samples: int = 50000
) -> Dict[str, float]:
    """Evaluate trained model on test set, save reports/metrics.json, and generate report figures."""
    logger.info("Evaluating model performance on test set...")
    
    if len(test_df) > max_eval_samples:
        test_sample = test_df.sample(n=max_eval_samples, random_state=42)
    else:
        test_sample = test_df
        
    X_test = test_sample[['user_avg', 'movie_avg']].values
    y_test = test_sample['is_liked'].values
    
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]
    
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, y_proba))
    avg_prec = float(average_precision_score(y_test, y_proba))
    
    metrics = {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc_auc, 4),
        "average_precision": round(avg_prec, 4),
        "test_samples_evaluated": len(test_sample)
    }
    
    # Save metrics.json
    settings.REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    report_data = {
        "model_name": "RandomForestClassifier (Tuned)",
        "test_metrics": metrics
    }
    with open(settings.METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2)
    logger.info(f"Test metrics saved to {settings.METRICS_PATH}: {metrics}")
    
    # Generate Evaluation Figures
    figures_dir = settings.FIGURES_DIR
    figures_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    fig, ax = plt.subplots(figsize=(6, 5))
    sns.heatmap(
        cm, annot=True, fmt='d', cmap='Blues', ax=ax,
        xticklabels=['Dislike (0)', 'Like (1)'],
        yticklabels=['Dislike (0)', 'Like (1)']
    )
    ax.set_title("Confusion Matrix (Random Forest)", fontweight='bold', pad=15)
    ax.set_ylabel("Actual Label", fontweight='bold')
    ax.set_xlabel("Predicted Label", fontweight='bold')
    plt.tight_layout()
    plt.savefig(figures_dir / "06_confusion_matrix.png", dpi=150)
    plt.close(fig)
    
    # 2. ROC Curve
    fpr, tpr, _ = roc_curve(y_test, y_proba)
    roc_auc_val = auc(fpr, tpr)
    fig, ax = plt.subplots(figsize=(7, 5))
    ax.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (AUC = {roc_auc_val:.3f})')
    ax.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
    ax.set_xlim([0.0, 1.0])
    ax.set_ylim([0.0, 1.05])
    ax.set_xlabel('False Positive Rate', fontweight='bold')
    ax.set_ylabel('True Positive Rate', fontweight='bold')
    ax.set_title('Receiver Operating Characteristic (ROC)', fontweight='bold')
    ax.legend(loc="lower right")
    ax.grid(True, linestyle="--", alpha=0.5)
    plt.tight_layout()
    plt.savefig(figures_dir / "06_roc_curve.png", dpi=150)
    plt.close(fig)
    
    # 3. Precision-Recall Curve
    precision_vals, recall_vals, _ = precision_recall_curve(y_test, y_proba)
    fig, ax = plt.subplots(figsize=(7, 5))
    ax.plot(recall_vals, precision_vals, color='purple', lw=2, label=f'PR curve (AP = {avg_prec:.3f})')
    ax.set_xlim([0.0, 1.0])
    ax.set_ylim([0.0, 1.05])
    ax.set_xlabel('Recall', fontweight='bold')
    ax.set_ylabel('Precision', fontweight='bold')
    ax.set_title('Precision-Recall Curve', fontweight='bold')
    ax.legend(loc="lower left")
    ax.grid(True, linestyle="--", alpha=0.5)
    plt.tight_layout()
    plt.savefig(figures_dir / "06_pr_curve.png", dpi=150)
    plt.close(fig)
    
    # 4. Feature Importance
    if hasattr(model, 'feature_importances_'):
        feature_names = ['User Avg Rating', 'Movie Avg Rating']
        importances = model.feature_importances_
        fig, ax = plt.subplots(figsize=(7, 4))
        sns.barplot(
            x=importances, y=feature_names, hue=feature_names,
            palette="magma", legend=False, ax=ax
        )
        ax.set_title("Random Forest Feature Importance", fontweight='bold')
        ax.set_xlabel("Mean Decrease in Impurity (Gini Importance)", fontweight='bold')
        ax.set_xlim(0, 1)
        ax.grid(True, linestyle="--", alpha=0.5)
        plt.tight_layout()
        plt.savefig(figures_dir / "06_feature_importance.png", dpi=150)
        plt.close(fig)
        
    logger.info(f"All evaluation plots generated and saved to {figures_dir}")
    return metrics
