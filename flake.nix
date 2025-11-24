{
  description = "Hermetic Build Environment for TNN-Criticality-Engine (SLSA Level 3)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
            nodePackages.typescript
            nodePackages.npm
            git
            # Tools for validation
            shellcheck
          ];

          shellHook = ''
            echo "Environment: SLSA Level 3 Hermetic Shell"
            echo "Node Version: $(node --version)"
          '';
        };

        packages.default = pkgs.buildNpmPackage {
          pname = "tnn-criticality-engine";
          version = "1.0.0";
          src = ./.;
          npmDepsHash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="; # To be filled after first build
          dontNpmBuild = true; # We use custom build script
          installPhase = ''
            npm run build
            mkdir -p $out/dist
            cp -r dist/* $out/dist
          '';
        };
      }
    );
}
