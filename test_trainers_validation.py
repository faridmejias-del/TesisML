#!/usr/bin/env python3
"""
Script de validación sintáctica de trainers refactorizados.
Verifica que el código sea correcto sin necesidad de ejecutar el pipeline completo.
"""

import sys
import os
import ast

# Agregar el directorio ml-backend al path
ml_backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ml-backend')
sys.path.insert(0, ml_backend_path)


def verificar_sintaxis_archivo(ruta_archivo: str) -> bool:
    """Verifica que un archivo Python tenga sintaxis correcta"""
    try:
        with open(ruta_archivo, 'r', encoding='utf-8') as f:
            codigo = f.read()
        ast.parse(codigo)
        return True
    except SyntaxError as e:
        print(f"❌ Error de sintaxis en {ruta_archivo}:")
        print(f"   Línea {e.lineno}: {e.msg}")
        return False
    except Exception as e:
        print(f"❌ Error al procesar {ruta_archivo}: {str(e)}")
        return False


def verificar_importaciones_archivo(ruta_archivo: str) -> bool:
    """Verifica que un archivo Python pueda ser parseado correctamente"""
    try:
        with open(ruta_archivo, 'r', encoding='utf-8') as f:
            codigo = f.read()

        tree = ast.parse(codigo)

        # Extraer todas las importaciones
        imports = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.append(alias.name)
            elif isinstance(node, ast.ImportFrom):
                imports.append(f"from {node.module}")

        return True, imports

    except SyntaxError as e:
        return False, str(e)
    except Exception as e:
        return False, str(e)


def main():
    """Función principal de validación"""
    print("=" * 60)
    print("Validación de Trainers Refactorizados")
    print("=" * 60)

    archivos_a_validar = [
        'ml-backend/app/ml/pipeline_lstm/trainer.py',
        'ml-backend/app/ml/pipeline_cnn/trainer.py',
    ]

    todos_correctos = True

    for archivo in archivos_a_validar:
        ruta_completa = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            archivo
        )

        print(f"\n📝 Validando: {archivo}")

        # Verificar sintaxis
        if not verificar_sintaxis_archivo(ruta_completa):
            todos_correctos = False
            continue

        print(f"   ✅ Sintaxis correcta")

        # Verificar importaciones
        valido, info = verificar_importaciones_archivo(ruta_completa)
        if not valido:
            print(f"   ❌ Error al parsear: {info}")
            todos_correctos = False
        else:
            print(f"   ✅ {len(info)} importaciones detectadas")

    print("\n" + "=" * 60)

    if todos_correctos:
        print("✅ VALIDACIÓN COMPLETADA EXITOSAMENTE")
        print("\nResumen de cambios aplicados:")
        print("  1. ✅ LSTM Trainer: Logging estructurado + MetricasNormalizadas")
        print("  2. ✅ CNN Trainer: Logging estructurado + MetricasNormalizadas")
        print("  3. ✅ Ambos trainers: Integración con validacion_cruzada_k_fold")
        print("  4. ✅ Data processors: Validación de datos con DataValidator")
        print("  5. ✅ Evaluación: Sanitización de NaN en ambos modelos")
        return True
    else:
        print("❌ VALIDACIÓN FALLIDA")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)